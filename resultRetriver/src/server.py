import sys


sys.path.append('../../es/datasets')
sys.path.append('../../es/es_core/')
from content_handler import ContentHandler
from flask import Flask, request

from workerTask.SearchModel import SearchModel

app = Flask(__name__, instance_relative_config=True)
ch = ContentHandler()


modelInst = SearchModel()

@app.route('/query')
def query():
    data = request.get_json()
    keywords = ch.get_keywords(data["query"])
    result = modelInst.getResult(data["query"]," ".join(keywords))
    result["keywords"] = keywords
    return result

@app.route('/queryWithoutKey')
def queryWithoutKey():
    data = request.get_json()
    result = modelInst.getResult(data["query"]," ".join(data["keywords"]))
    result["keywords"] = data["keywords"]
    return result
    
if __name__ == '__main__':
    app.run(host='0.0.0.0')
