# encoding: utf-8 
import jieba
import jieba.posseg as pseg
import csv
import sqlite3
import sys
import re
import string
reload(sys)
sys.setdefaultencoding('utf-8')

happy_list=[]
like_list=[]
anger_list=[]
sad_list=[]
fear_list=[]
dislike_list=[]
shock_list=[]
negate_list=[]

n_list=['j','l','n','nt','t','vn']

emo_dic=['happy','like','anger','sad','fear','dislike','shock']

def separate(str):
	words=pseg.cut(str)
	# for word, flag in words:
	# 	print('%s %s'%(word,flag))
	return words
	# seg_list=jieba.lcut(str,cut_all=False)
	# for i in range(0,len(seg_list)):
	# 	print seg_list[i]
	# return seg_list

def read_in_file(filename,emo_list):
	csv_file=file(filename,'rb')
	reader=csv.reader(csv_file)
	for row in reader:
		emo_list.append(row[0].decode('gbk','ignore'))
	csv_file.close()

def read_in_content(db,content_num):
	content='select text from weibo where rowid = '+str(content_num)
	# print content
	db.execute(content)
	dbresult=c.fetchall()
	# print dbresult
	return dbresult[0][0].decode('utf-8')

def count_db(db):
	content='select count(*) from weibo'
	db.execute(content)
	dbresult=c.fetchall()
	return dbresult[0][0]

def write_emo_type(db,etype,noun,num):
	content='update weibo set '+emo_dic[etype]+' = 1, noun = "'+noun+'"where rowid = '+str(num)
	db.execute(content)
	conn.commit()
	
read_in_file('category/happy.CSV',happy_list)
read_in_file('category/like.CSV',like_list)
read_in_file('category/anger.CSV',anger_list)
read_in_file('category/sad.CSV',sad_list)
read_in_file('category/fear.CSV',fear_list)
read_in_file('category/dislike.CSV',dislike_list)
read_in_file('category/shock.CSV',shock_list)
read_in_file('category/negate.CSV',negate_list)

conn=sqlite3.connect("mydata_12_25_af.db")
conn.text_factory=str
c=conn.cursor()
max_num=count_db(c)

# for neg_word in negate_list:
# 	print neg_word

for j in range(0,10):
	emo_list=[0,0,0,0,0,0,0]
	text=read_in_content(c,j+1)
	# print text
	text_sen=re.findall(u'[\u4e00-\u9fff]+', text)
	noun=''
	for sen in text_sen:
		sen=sen.decode("utf-8")
		text_list=separate(sen)
		negate=0
		flag_h=-1
		for word, flag in text_list:
			print('%s %s'%(word,flag))
			if word in negate_list:
				negate=negate+1
			if word in happy_list:
				emo_list[0]+=1
				flag_h=0
			elif word in like_list:
				emo_list[1]+=1
				flag_h=1
			elif word in anger_list:
				emo_list[2]+=1
				flag_h=2
			elif word in sad_list:
				emo_list[3]+=1
				flag_h=3
			elif word in fear_list:
				emo_list[4]+=1
				flag_h=4
			elif word in dislike_list:
				emo_list[5]+=1
				flag_h=5
			elif word in shock_list:
				emo_list[6]+=1
				flag_h=6

			if flag in n_list:
				noun=noun+word+','

		if negate%2!=0 and flag_h!=-1:
			emo_list[flag_h]-=1

	if max(emo_list)!=0 and emo_list.count(max(emo_list))==1:
		emo_type=emo_list.index(max(emo_list))
		print emo_type
		write_emo_type(c,emo_type,noun,j+1)

conn.close()