import os
import sqlite3
from flask import *

app = Flask(__name__)

@app.route('/upload', methods=['POST'])
def upload():
    content = request.json;
    print content['database']
    conn=sqlite3.connect(content['database'])
    conn.text_factory=str
    c=conn.cursor()
    print content['sql']
    c.execute(content['sql'])
    dbresult=c.fetchall()
    conn.close()
    #print dbresult
    return json.dumps(dbresult,ensure_ascii=False)

@app.route('/')
def index():
    return render_template('index.html')

if __name__ == "__main__":
    app.debug=True
    app.run('0.0.0.0', 8080)