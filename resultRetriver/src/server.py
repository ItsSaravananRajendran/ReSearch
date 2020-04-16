import sys

from flask import Flask
from workerTask.main import modelInst

sys.path.append('../../es/es_core/')
from content_handler import ContentHandler

app = Flask(__name__, instance_relative_config=True)
ch = ContentHandler()


def get_result(data):
    return modelInst.get_result(data["query"], data["keywords"])


@app.route('/query')
def query():
    data = request.get_json()
    inp = {"query": data.get('query', ''), "keywords": ch.get_keywords(data.get('query', ''))}
    result = get_result(inp);
    return result


if __name__ == '__main__':
    app.run(host='0.0.0.0')
