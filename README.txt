THIS FOLDER INCLUDE
===============================================================================
category
 -anger.CSV
 -dislike.CSV
 -fear.CSV
 -happy.CSV
 -like.CSV
 -sad.CSV
 -shock.CSV
 -negate.CSV
dictionaries of 7 types of emotion and negative word

static
 css,javascript and cartographic information files

templates
 html file

app.py
 a python script file to get data from Weibo by WeiboAPI

judge.py
 a python script file to judge Weibo's emotion type

kanjo.py
 a python script file to start a web server in your own PC

score.py
 a python script file to calculate the number of weibo, which is separated from 7 types of emotion and weibo's geographic position

mydata.db
 a weibo database(common day,about 30 hours)

mydata_12_25_af.db
 a weibo database(Christmas,about 3 hours)

mydata_12_25_af_pro_v2.db
 after process the database of Christmas by score.py, you can get this database
==================================================================================
DATABASE
id		weibo's id number
x		weibo's longitude
y		weibo's latitude
time    	when this weibo was sent
text		weibo's content
happy...shock	if this attribute is true, it represents the weibo's emotion type(in original database)
		it represents the number of weibo in this 2(longitude)*2(latitude) geographic area(in processed database)
===========================================================================================================================
PAY ATTENTION
Database is supported by SQLite
You need to install FLASK(a python web framework) to start your own server on PC
This project is still under development
All rights reserved by LU
  

