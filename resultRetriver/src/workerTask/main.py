import os

import torch
from transformers import BertForQuestionAnswering
from transformers import BertTokenizer
from transformers import BartTokenizer, BartForConditionalGeneration
from Bio import Entrez, Medline
try:
    from StringIO import StringIO
except ImportError:
    from io import StringIO
import re
import json
from pyserini.search import pysearch
import tensorflow as tf
import tensorflow_hub as hub
import numpy as np

torch_device = 'cuda' if torch.cuda.is_available() else 'cpu'

USE_SUMMARY = True
FIND_PDFS = False

minDate = '2020/04/02'
luceneDir = '/home/user/lucene-index-covid-2020-04-03/'
BIOASQ_DIR = '/home/user/biobert/bioasq-biobert'


def embed_useT(module):
    with tf.Graph().as_default():
        sentences = tf.compat.v1.placeholder(tf.string)
        embed = hub.Module(module)
        embeddings = embed(sentences)
        session = tf.compat.v1.train.MonitoredSession()
    return lambda x: session.run(embeddings, {sentences: x})


embed_fn = embed_useT('/home/user/sentence_wise_email/module/module_useT')


def reconstructText(tokens, start=0, stop=-1):
    tokens = tokens[start: stop]
    if '[SEP]' in tokens:
        sepind = tokens.index('[SEP]')
        tokens = tokens[sepind+1:]
    txt = ' '.join(tokens)
    txt = txt.replace(' ##', '')
    txt = txt.replace('##', '')
    txt = txt.strip()
    txt = " ".join(txt.split())
    txt = txt.replace(' .', '.')
    txt = txt.replace('( ', '(')
    txt = txt.replace(' )', ')')
    txt = txt.replace(' - ', '-')
    txt_list = txt.split(' , ')
    txt = ''
    nTxtL = len(txt_list)
    if nTxtL == 1:
        return txt_list[0]
    newList =[]
    for i,t in enumerate(txt_list):
        if i < nTxtL -1:
            if t[-1].isdigit() and txt_list[i+1][0].isdigit():
                newList += [t,',']
            else:
                newList += [t, ', ']
        else:
            newList += [t]
    return ''.join(newList)


def getHits(query,keywords,searcher):
    hits = searcher.search(query + '. ' + keywords)
    n_hits = len(hits)
    ## collect the relevant data in a hit dictionary
    hit_dictionary = {}
    for i in range(0, n_hits):
        doc_json = json.loads(hits[i].raw)
        idx = str(hits[i].docid)
        hit_dictionary[idx] = doc_json
        hit_dictionary[idx]['title'] = hits[i].lucene_document.get("title")
        hit_dictionary[idx]['authors'] = hits[i].lucene_document.get("authors")
        hit_dictionary[idx]['doi'] = hits[i].lucene_document.get("doi")

    ## scrub the abstracts in prep for BERT-SQuAD
    for idx,v in hit_dictionary.items():
        abs_dirty = v['abstract']
        # looks like the abstract value can be an empty list
        v['abstract_paragraphs'] = []
        v['abstract_full'] = ''
        if abs_dirty:
            # looks like if it is a list, then the only entry is a dictionary wher text is in 'text' key
            # looks like it is broken up by paragraph if it is in that form.  lets make lists for every paragraph
            # and a new entry that is full abstract text as both could be valuable for BERT derrived QA
            if isinstance(abs_dirty, list):
                for p in abs_dirty:
                    v['abstract_paragraphs'].append(p['text'])
                    v['abstract_full'] += p['text'] + ' \n\n'

            # looks like in some cases the abstract can be straight up text so we can actually leave that alone
            if isinstance(abs_dirty, str):
                v['abstract_paragraphs'].append(abs_dirty)
                v['abstract_full'] += abs_dirty + ' \n\n'
    return hit_dictionary


class searchModel:
    def __init__(self):
        self.QA_MODEL = BertForQuestionAnswering.from_pretrained(BIOASQ_DIR)
        self.QA_TOKENIZER = BertTokenizer.from_pretrained(BIOASQ_DIR)
        self.QA_MODEL.to(torch_device)
        self.QA_MODEL.eval()
        self.searcher = pysearch.SimpleSearcher(luceneDir)
        self.USE_SUMMARY = True;

        if self.USE_SUMMARY:
            self.SUMMARY_TOKENIZER = BartTokenizer.from_pretrained('bart-large-cnn')
            self.SUMMARY_MODEL = BartForConditionalGeneration.from_pretrained('bart-large-cnn')
            self.SUMMARY_MODEL.to(torch_device)
            self.SUMMARY_MODEL.eval()


    def makeBERTSQuADPrediction(self,document, question):
        ## we need to rewrite this function so that it chuncks the document into 250-300 word segments with
        ## 50 word overlaps on either end so that it can understand and check longer abstracts
        nWords = len(document.split())
        input_ids_all = self.QA_TOKENIZER.encode(question, document)
        tokens_all = self.QA_TOKENIZER.convert_ids_to_tokens(input_ids_all)
        overlapFac = 1.1
        if len(input_ids_all)*overlapFac > 2048:
            nSearchWords = int(np.ceil(nWords/5))
            quarter = int(np.ceil(nWords/4))
            docSplit = document.split()
            docPieces = [' '.join(docSplit[:int(nSearchWords*overlapFac)]), 
                        ' '.join(docSplit[quarter-int(nSearchWords*overlapFac/2):quarter+int(quarter*overlapFac/2)]),
                        ' '.join(docSplit[quarter*2-int(nSearchWords*overlapFac/2):quarter*2+int(quarter*overlapFac/2)]),
                        ' '.join(docSplit[quarter*3-int(nSearchWords*overlapFac/2):quarter*3+int(quarter*overlapFac/2)]),
                        ' '.join(docSplit[-int(nSearchWords*overlapFac):])]
            input_ids = [self.QA_TOKENIZER.encode(question, dp) for dp in docPieces]        
            
        elif len(input_ids_all)*overlapFac > 1536:
            nSearchWords = int(np.ceil(nWords/4))
            third = int(np.ceil(nWords/3))
            docSplit = document.split()
            docPieces = [' '.join(docSplit[:int(nSearchWords*overlapFac)]), 
                        ' '.join(docSplit[third-int(nSearchWords*overlapFac/2):third+int(nSearchWords*overlapFac/2)]),
                        ' '.join(docSplit[third*2-int(nSearchWords*overlapFac/2):third*2+int(nSearchWords*overlapFac/2)]),
                        ' '.join(docSplit[-int(nSearchWords*overlapFac):])]
            input_ids = [self.QA_TOKENIZER.encode(question, dp) for dp in docPieces]        
            
        elif len(input_ids_all)*overlapFac > 1024:
            nSearchWords = int(np.ceil(nWords/3))
            middle = int(np.ceil(nWords/2))
            docSplit = document.split()
            docPieces = [' '.join(docSplit[:int(nSearchWords*overlapFac)]), 
                        ' '.join(docSplit[middle-int(nSearchWords*overlapFac/2):middle+int(nSearchWords*overlapFac/2)]),
                        ' '.join(docSplit[-int(nSearchWords*overlapFac):])]
            input_ids = [self.QA_TOKENIZER.encode(question, dp) for dp in docPieces]
        elif len(input_ids_all)*overlapFac > 512:
            nSearchWords = int(np.ceil(nWords/2))
            docSplit = document.split()
            docPieces = [' '.join(docSplit[:int(nSearchWords*overlapFac)]), ' '.join(docSplit[-int(nSearchWords*overlapFac):])]
            input_ids = [self.QA_TOKENIZER.encode(question, dp) for dp in docPieces]
        else:
            input_ids = [input_ids_all]
        absTooLong = False    
        
        answers = []
        cons = []
        for iptIds in input_ids:
            tokens = self.QA_TOKENIZER.convert_ids_to_tokens(iptIds)
            sep_index = iptIds.index(self.QA_TOKENIZER.sep_token_id)
            num_seg_a = sep_index + 1
            num_seg_b = len(iptIds) - num_seg_a
            segment_ids = [0]*num_seg_a + [1]*num_seg_b
            assert len(segment_ids) == len(iptIds)
            n_ids = len(segment_ids)
            #print(n_ids)

            if n_ids < 512:
                start_scores, end_scores = self.QA_MODEL(torch.tensor([iptIds]).to(torch_device), 
                                        token_type_ids=torch.tensor([segment_ids]).to(torch_device))
            else:
                #this cuts off the text if its more than 512 words so it fits in model space
                #need run multiple inferences for longer text. add to the todo
                print('****** warning only considering first 512 tokens, document is '+str(nWords)+' words long.  There are '+str(n_ids)+ ' tokens')
                absTooLong = True
                start_scores, end_scores = self.QA_MODEL(torch.tensor([iptIds[:512]]).to(torch_device), 
                                        token_type_ids=torch.tensor([segment_ids[:512]]).to(torch_device))
            start_scores = start_scores[:,1:-1]
            end_scores = end_scores[:,1:-1]
            answer_start = torch.argmax(start_scores)
            answer_end = torch.argmax(end_scores)
            #print(answer_start, answer_end)
            answer = reconstructText(tokens, answer_start, answer_end+2)
        
            if answer.startswith('. ') or answer.startswith(', '):
                answer = answer[2:]
                
            c = start_scores[0,answer_start].item()+end_scores[0,answer_end].item()
            answers.append(answer)
            cons.append(c)
        
        maxC = max(cons)
        iMaxC = [i for i, j in enumerate(cons) if j == maxC][0]
        confidence = cons[iMaxC]
        answer = answers[iMaxC]
        
        sep_index = tokens_all.index('[SEP]')
        full_txt_tokens = tokens_all[sep_index+1:]
        
        abs_returned = reconstructText(full_txt_tokens)

        ans={}
        ans['answer'] = answer
        #print(answer)
        if answer.startswith('[CLS]') or answer_end.item() < sep_index or answer.endswith('[SEP]'):
            ans['confidence'] = -1000000
        else:
            #confidence = torch.max(start_scores) + torch.max(end_scores)
            #confidence = np.log(confidence.item())
            ans['confidence'] = confidence
        #ans['start'] = answer_start.item()
        #ans['end'] = answer_end.item()
        ans['abstract_bert'] = abs_returned
        ans['abs_too_long'] = absTooLong
        return ans


    def searchAbstracts(self,hit_dictionary, question):
        abstractResults = {}
        for k,v in hit_dictionary.items():
            abstract = v['abstract_full']
            if abstract:
                ans = self.makeBERTSQuADPrediction(abstract, question)
                if ans['answer']:
                    confidence = ans['confidence']
                    abstractResults[confidence]={}
                    abstractResults[confidence]['answer'] = ans['answer']
                    abstractResults[confidence]['abstract_bert'] = ans['abstract_bert']
                    abstractResults[confidence]['idx'] = k
                    abstractResults[confidence]['abs_too_long'] = ans['abs_too_long']
                    
        cList = list(abstractResults.keys())

        if cList:
            maxScore = max(cList)
            total = 0.0
            exp_scores = []
            for c in cList:
                s = np.exp(c-maxScore)
                exp_scores.append(s)
            total = sum(exp_scores)
            for i,c in enumerate(cList):
                abstractResults[exp_scores[i]/total] = abstractResults.pop(c)
        return abstractResults


    def getSummary(self,hit_dictionary, answers, question):
        confidence = list(answers.keys())
        confidence.sort(reverse=True)
        
        for c in confidence:
            if c>0 and c <= 1 and len(answers[c]['answer']) != 0:
                if 'idx' not in  answers[c]:
                    continue
                rowData = []
                idx = answers[c]['idx']
                title = hit_dictionary[idx]['title']
                authors = hit_dictionary[idx]['authors'] + ' et al.'
                doi = '<a href="https://doi.org/'+hit_dictionary[idx]['doi']+'" target="_blank">' + title +'</a>'

                
                full_abs = answers[c]['abstract_bert']
                bert_ans = answers[c]['answer']
                
                
                split_abs = full_abs.split(bert_ans)
                sentance_beginning = split_abs[0][split_abs[0].rfind('.')+1:]
                if len(split_abs) == 1:
                    sentance_end_pos = len(full_abs)
                    sentance_end =''
                else:
                    sentance_end_pos = split_abs[1].find('. ')+1
                    if sentance_end_pos == 0:
                        sentance_end = split_abs[1]
                    else:
                        sentance_end = split_abs[1][:sentance_end_pos]
                    
                #sentance_full = sentance_beginning + bert_ans+ sentance_end
                answers[c]['full_answer'] = sentance_beginning+bert_ans+sentance_end
                answers[c]['sentence_beginning'] = sentance_beginning
                answers[c]['sentence_end'] = sentance_end
                answers[c]['title'] = title
                answers[c]['doi'] = doi
            else:
                answers.pop(c)
        
        
        ## now rerank based on semantic similarity of the answers to the question
        cList = list(answers.keys())
        allAnswers = [answers[c]['full_answer'] for c in cList]
        
        messages = [question]+allAnswers
        
        encoding_matrix = embed_fn(messages)
        similarity_matrix = np.inner(encoding_matrix, encoding_matrix)
        rankings = similarity_matrix[1:,0]
        
        for i,c in enumerate(cList):
            answers[rankings[i]] = answers.pop(c)

        ## now form pandas dv
        confidence = list(answers.keys())
        confidence.sort(reverse=True)
        ranked_aswers = []
        for c in confidence:
            ranked_aswers.append(' '.join([answers[c]['full_answer']]))
        
        
        if self.USE_SUMMARY:
            ## try generating an exacutive summary with extractive summarizer
            allAnswersTxt = ' '.join(ranked_aswers[:6]).replace('\n','')
    
            answers_input_ids = self.SUMMARY_TOKENIZER.batch_encode_plus([allAnswersTxt], return_tensors='pt', max_length=1024)['input_ids'].to(torch_device)
            summary_ids = self.SUMMARY_MODEL.generate(answers_input_ids,
                                                num_beams=10,
                                                length_penalty=1.2,
                                                max_length=1024,
                                                min_length=64,
                                                no_repeat_ngram_size=4)

            exec_sum = self.SUMMARY_TOKENIZER.decode(summary_ids.squeeze(), skip_special_tokens=True)
      
        finalResult = [{"summary":exec_sum}]
        for key in answers:
            obj = answers[key];
            obj['con'] = key;
            finalResult.append(obj);    
        return finalResult;

    def getResult(self,query,keywords):
        hits = getHits(query,keywords,self.searcher)
        answers = self.searchAbstracts(hits,query)
        return self.getSummary(hits,answers,query)



modelInst = searchModel()
