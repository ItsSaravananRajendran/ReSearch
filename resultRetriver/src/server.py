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
    result = modelInst.getResult(data["query"]," ".join(ch.get_keywords(data["query"])))
    return result
    
if __name__ == '__main__':
    app.run(host='0.0.0.0')
