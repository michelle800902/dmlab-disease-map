# -*- coding: utf-8 -*-
from django.conf import settings

from os.path import abspath,dirname
import os
import logging
os.environ['TZ'] = 'Asia/Taipei'
dname = dirname(dirname(abspath(__file__)))

# fmt = '[%(asctime)s][%(levelname)s][%(process)d][%(filename)s: %(lineno)d] %(message)s'
# datefmt = '%d/%b/%Y %H:%M:%S'
# formatter = logging.Formatter(fmt, datefmt)

# logger = logging.getLogger(__name__)
# logger.setLevel(logging.INFO)
# fh = logging.FileHandler(os.path.join( dname,'log',"DSPmap.log" ))
# fh.setLevel(logging.INFO)
# fh.setFormatter(formatter)
# logger.addHandler(fh)

from django.shortcuts import render
from django.shortcuts import render_to_response, HttpResponse
from django.template import RequestContext
from django.http import HttpResponseRedirect
from django.core.urlresolvers import reverse
from django.views.decorators.csrf import csrf_exempt
from dspapp.models import ptt_contents
from django.db.models import Q
import operator

import json
import time
import datetime
from datetime import datetime as dt
from dspapp.handle_g0v import g0v_data_handler
g0v_data = g0v_data_handler( os.path.join(dname,'g0v_data') )
# print settings.BASE_DIR

# import GeoIP
# import pygeoip
# gi = GeoIP.open("GeoLiteCity.dat", GeoIP.GEOIP_INDEX_CACHE | GeoIP.GEOIP_CHECK_CACHE)
# gi = pygeoip.GeoIP('GeoLiteCity.dat')
# print gi.record_by_name("74.125.67.100") # a www.google.com IP

def get_lat_or_lng(p,target):
    latlng = p.latlng
    if latlng == 'None,None':
        return None
    lat, lng = latlng.split(',')
    if target == 'lat':
        return lat
    else:
        return lng

def labeling_content(content,category_list=None):
    cat = [ u'登革熱', u'A型肝炎', u'流感', u'腸病毒' ]
    # cat = [ u'登革熱', u'肝炎', u'流感', u'腸病毒' ]
    # cat = [ u'登革熱', u'A型', u'流感', u'腸病毒' ]
    cat = [ i for i in cat if i in category_list ] if category_list else cat
    cnt = [ (typ,content.count(typ)) for typ in cat ]
    result = max(cnt,key=lambda x:x[1])
    if result[1] > 0:
        return result[0]
    else:
        return u'其他'

def get_ptt_dic(p,light_content=False,category_list=[]):
    return {
        'id': p.id,
        'url': p.url,
        'title': u'{} {}'.format(p.title_class,p.title_content),
        # 'content': p.content if light_content == False else p.content[:20],
        'content': p.content if light_content == False else '', 
        'description': p.content if light_content == False else p.content[:100],
        'date': str(p.tm).split('+')[0],
        # 'date': str(dt.fromtimestamp( int(p.tm) )),
        'date_int': (dt.strptime(str(p.tm).split('+')[0],'%Y-%m-%d %H:%M:%S')-datetime.datetime(1970,1,1)).total_seconds(),
        # 'date_int': time.mktime(p.date.timetuple()) + p.date.microsecond / 1E6,
        # 'date_int': p.tm if p.tm else (p.date-datetime.datetime(1970,1,1)).total_seconds(),
        'tm':(dt.strptime(str(p.tm).split('+')[0],'%Y-%m-%d %H:%M:%S')-datetime.datetime(1970,1,1)).total_seconds(),
        'ip': p.ip,
        'latlng': p.latlng,
        'latitude': get_lat_or_lng(p,'lat'),
        'longitude': get_lat_or_lng(p,'lng'),
        'category': labeling_content(p.content,category_list),
    }

def value_check_pass(p,get_dic):
    try:
        get_dic(p)
        return True
    except:
        return False

def belong_cat(content,category_list):
    if len(category_list) == 0:
        return True
    # cnt = [ content.count(typ) for typ in category_list ]
    # if '登革熱' in content or u'登革熱' in content:
    # if u'登革熱' in content:
    #     cnt = { typ:content.count(typ) for typ in category_list }
    #     raise Exception(u'{}\n{}\n{}'.format(cnt,content).encode('utf8'))
    # if max( cnt ) == 0:
    #     return False
    # return True

    cnt = [ typ in content for typ in category_list ]
    return True in cnt

def return_response(data):
    response_data = json.dumps(data)
    response = HttpResponse(response_data, content_type='application/json; charset=UTF-8')
    response['Content-Length'] = len(response_data)
    return response

def index(request):
    # return render_to_response(
    #     'index.html', context_instance=RequestContext(request)
    # )
    return render(request, 'index.html', "")

def all_data(request,light_content=False):
    start_time = request.GET.get('start_time')
    end_time = request.GET.get('end_time')
    category_list = request.GET.get('category')
    category_list = json.loads(category_list) if category_list else []

    # print category_list
    # print category_list[0]
    # print [category_list[0]]
    # print type(category_list[0])

    # if u'其他' in category_list:
    #     category_list.remove(u'其他')
    #     category_list.append(u'疫情')
    # if u'A型肝炎' in category_list:
        # category_list.remove(u'A型肝炎')
        # category_list.append(u'肝炎')
        # category_list.append(u'A型')


    data_gtr = ptt_contents.objects.all()

    if start_time:
        start_time = int(start_time) / 1000
        data_gtr = data_gtr.filter( tm__gte = dt.fromtimestamp(start_time) )

    if end_time :
        end_time = int(end_time) / 1000
        data_gtr = data_gtr.filter( tm__lte = dt.fromtimestamp(end_time) )
    # print data_gtr.count()

    # for c in category_list:
    #     data_gtr = data_gtr.filter( content__contains = c )
    # query = reduce(operator.or_, (Q(content__contains=x) for x in category_list))
    # data_gtr.filter(query)
    data_gtr = data_gtr.filter( reduce(lambda x, y: x | y, [Q(content__contains=x) for x in category_list]) )
    print unicode(data_gtr.query).encode('utf8')

    heatmap_data = g0v_data.get_data( category_list, start_time, end_time )

    response_data = [
        get_dic(p,light_content,category_list)
        for (gtr, get_dic) in [ (data_gtr,get_ptt_dic) ]
        for p in gtr
        # if u'疫情' in p.content or belong_cat(p.content,category_list)
        # if u'疫情' in p.content
        # if belong_cat(p.content,category_list) and value_check_pass(p,get_dic)
        ]

    # print "#Data:", len(response_data)

    # no_ip_data = [ r for r in response_data if r['ip'] == None ]
    ip_data = [ r for r in response_data if r['ip'] ]
    # response_data = no_ip_data[:100] + ip_data[:100]
    # response_data = ip_data[:5]
    # response_data = ip_data[:500]
    # response_data = ip_data[:]

    response_data = sorted(response_data,key=lambda x: x['date_int'])

    return {
        'response_data': response_data,
        'heatmap_data': heatmap_data
    }

def get_all_data2(request):
    response_data = all_data(request)['response_data']
    return HttpResponse(json.dumps(response_data), content_type='application/json; charset=UTF-8')
    # return HttpResponse(json.dumps([{"N_instance":len(response_data)}]), content_type='application/json; charset=UTF-8')

def get_all_light_data2(request):
    st_time = time.time()
    data = all_data(request,light_content=True)
    print "Running time of get_all_light_data2:", time.time()-st_time
    # return HttpResponse(json.dumps([{"N_instance":len(response_data)}]), content_type='application/json; charset=UTF-8')
    # return HttpResponse(json.dumps(response_data), content_type='application/json; charset=UTF-8')
    for rd in data['response_data']:
        rd['description'] = rd['description'].replace('\n','<br>')
    #     rd['content'] = ""
    # a = json.dumps(data)
    # print a[57342:57342+100]
    # print a[57342-50:57342+100]

    # response_data = json.dumps(data)
    # response = HttpResponse(response_data, content_type='application/json; charset=UTF-8')
    # response['Content-Length'] = len(response_data)
    return return_response(data)

def get_content(request):
    try:
        url = request.GET.get('url')
        data = ptt_contents.objects.get(url=url)
        return HttpResponse(data.content.replace('\n','<br>'))
    except:
        return HttpResponse('None')
