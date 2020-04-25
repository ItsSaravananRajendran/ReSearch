import sys

sys.path.append('../../es/datasets')
sys.path.append('../../es/es_core/')
sys.path.append('../../top_search/')
from content_handler import ContentHandler
from flask import Flask, request

from workerTask.SearchModel import SearchModel
from top_search import top_search_impl

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


@app.route('/topSearch', methods=['GET'])
def top_search():
    try:
        start = int(request.args.get('start'))
        to = int(request.args.get('to'))
        if start is not None and to is not None:
            return top_search_impl(start, to)
    except Exception:
        pass

    return top_search_impl()


if __name__ == '__main__':
    app.run(host='0.0.0.0')
