
from flask import Flask

from workerTask.main import modelInst
from celery import Celery


app = Flask(__name__, instance_relative_config=True)

def getResult(data):
    return modelInst.getResult(data["query"],data["keywords"])

@app.route('/query')
def query():
    data = request.get_json()
    inp = {"query":data.get('query',''), "keywords":data.get('keywords','')}
    result = getResult(inp);
    return result;
    
if __name__ == '__main__':
    app.run(host= '0.0.0.0')