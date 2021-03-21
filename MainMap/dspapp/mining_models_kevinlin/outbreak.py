s = """2006-05-08
2007-01-14
2008-11-02
2009-03-15
2009-03-26
2009-04-10
2009-05-19
2010-03-09
2010-04-04
2010-05-04
2010-05-26
2010-09-19
2011-03-14
2011-04-09
2011-07-11
2011-09-20
2011-09-25
2012-01-01
2012-03-26
2012-07-11
2012-08-08
2013-03-14
2013-06-04
2013-11-02
2014-01-12
2014-07-14
2014-09-07
2014-11-21
2014-12-15
2015-01-18
2015-04-19
2015-05-07
2015-08-26
2016-01-10
2016-01-27
2016-02-19
2016-03-08
2016-05-08
2016-07-19
2016-07-31
2016-08-18
2016-09-01
2016-11-22
2016-12-08
2016-12-13
2017-01-12
2017-02-17
2017-04-05
2017-04-28
2017-06-05
2017-06-18"""


def get_outbreak():
    data = []
    for line in s.split('\n'):
        data.append({
            'time':line
        })        
    return data