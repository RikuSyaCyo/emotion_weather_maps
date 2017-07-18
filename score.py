import sqlite3
import sys
import re
import string
reload(sys)
sys.setdefaultencoding('utf-8')
count=[0,0,0,0,0,0,0]
noun=['','','','','','','']
emo_list=['happy','like','anger','sad','fear','dislike','shock']
def calculate_score(x,y,emo_type,sq):
	content='select count(*) from weibo where x>'+str(x)+' and x<='+str(x+sq)+' and y>'+str(y)+' and y<='+str(y+sq)+' and '+emo_type+' = 1 and rowid>135420'
	c_out.execute(content)
	dbresult=c_out.fetchall()
	return dbresult[0][0]
def get_noun(x,y,emo_type,sq):
	content='select noun from weibo where x>'+str(x)+' and x<='+str(x+sq)+' and y>'+str(y)+' and y<='+str(y+sq)+' and '+emo_type+' = 1 and rowid>135420'
	# print content
	c_out.execute(content)
	dbresult=c_out.fetchall()
	noun_string=''
	if len(dbresult)!=0:
		# print len(dbresult)
		for i in range(0,len(dbresult)):
			if dbresult[i][0] is not None:
				noun_string=noun_string+','+dbresult[i][0]
		return noun_string
	else:
		return ''


conn_in=sqlite3.connect("mydata_4_6_pro_0.db")
conn_in.text_factory=str
c_in=conn_in.cursor()

conn_out=sqlite3.connect("mydata_0.db")
conn_out.text_factory=str
c_out=conn_out.cursor()

sq=2

for i in range(0,40/sq):
	for j in range(0,70/sq):
		x=i*sq+15
		y=j*sq+70
		ins_content="insert into score values("+str(x)+" , "+str(y)+" , "
		for k in range(0,7):
			count[k]=calculate_score(x,y,emo_list[k],sq)
			if k==6:
				ins_content=ins_content+str(count[k])
			else:
				ins_content=ins_content+str(count[k])+' , '
		for p in range(0,7):
			noun[p]=get_noun(x,y,emo_list[p],sq)
			if p==6:
				ins_content=ins_content+',"'+noun[p]+'")'
			else:
				ins_content=ins_content+',"'+noun[p]+'"'
		print ins_content
		c_in.execute(ins_content)
		conn_in.commit()
conn_in.close()
conn_out.close()


