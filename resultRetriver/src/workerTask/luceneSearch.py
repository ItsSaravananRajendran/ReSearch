from pyserini.search import pysearch
import json

from constant import luceneDir


#query = 'Which non-pharmaceutical interventions limit tramsission'
#keywords = '2019-nCoV, SARS-CoV-2, COVID-19, non-pharmaceutical interventions, npi'

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