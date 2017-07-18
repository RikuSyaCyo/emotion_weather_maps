# -*- coding: utf-8 -*-
#/usr/bin/env python
#导入SDK包
import weibo
import traceback
#导入浏览器包
import webbrowser
import time
import sqlite3
import re
import os

APP_KEY='3178616972'
APP_SECRET='7b53c7aa40f29cd7b23c81b60aa2acae'
Redirect_url = 'https://api.weibo.com/oauth2/default.html'
AUTH_URL = 'https://api.weibo.com/oauth2/authorize'
access_token=['0','0','0','0','0','0']
expires_in=['0','0','0','0','0','0']

api = weibo.APIClient(app_key=APP_KEY,app_secret=APP_SECRET,redirect_uri=Redirect_url)

for j in range(0,6):
    authorize_url = api.get_authorize_url( )

    print (authorize_url)

    webbrowser.open_new(authorize_url)
    code =raw_input('Please enter your code:').strip()

    Request = api.request_access_token(code, Redirect_url)
    access_token[j] = Request.access_token

    expires_in[j] = Request.expires_in
    print access_token[j]
    print expires_in[j]
    os.system('pause')

k=0
counter=0
while(k<6):
    try:
        api.set_access_token(access_token[k], expires_in[k])
        # time_limit=api.account.rate_limit_status.get()
        # print time_limit
        call_time=0
        print k
        while(call_time<145):
            get_result = api.statuses.public_timeline.get(count=200)
            #取出statuese字段 
            call_time=call_time+1
            print call_time
            get_statuses= get_result.__getattr__('statuses')
            # time_limit=api.account.rate_limit_status.get()
            # print time_limit
            # print time_limit['reset_time']
            # print time_limit['remaining_hits']
            # print len(get_statuses)
            # print get_statuses[0]
            counter=counter+len(get_statuses)
            conn=sqlite3.connect("mydata_12_25_af.db")
            conn.text_factory=str
            c=conn.cursor()
            for i in range(0,len(get_statuses)):
                if get_statuses[i]['geo'] is not None:
                    x=get_statuses[i]['geo']['coordinates'][0]
                    y=get_statuses[i]['geo']['coordinates'][1]
                    text=get_statuses[i]['text']
                    re.sub("[\s+\.\!\/_,$%^*(+\"\']+|[+——！，。？、~@#￥%……&*（）]+", "",text)
                    text=text.encode('utf-8','ignore').replace("\"","\\\"")
                    wid=get_statuses[i]['id']
                    wtime=str(get_statuses[i]['created_at'])
                    try:
                        content='insert into weibo values ('+str(wid)+',"'+text+'",'+str(x)+','+str(y)+',"'+wtime+'")'
                        c.execute(content)
                    except:
                        continue
            conn.commit()
            conn.close()
            print counter
            time.sleep(5)
        if k==5:
            k=-1
        k=k+1
    except:
        print 'traceback.print_exc():'; traceback.print_exc()
        if k==5:
            k=-1
        k=k+1