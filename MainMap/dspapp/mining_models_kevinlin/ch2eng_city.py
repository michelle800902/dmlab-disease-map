# -*- coding: utf-8 -*-
def chtoeng(word):
    map_list = [ [ u'臺北市', 'taipei'],
                 [ u'新北市', 'new_taipei'],
                 [ u'彰化縣', 'changhua'],
                 [ u'彰化市', 'changhua'],
                 [ u'嘉義縣', 'hiayi'],
                 [ u'嘉義市', 'hiayi'],
                 [ u'桃園縣', 'taoyuan'],
                 [ u'桃園市', 'taoyuan'],
                 [ u'臺中縣', 'taichung'],
                 [ u'臺中市', 'taichung'],
                 [ u'高雄縣', 'kaohsiung'],
                 [ u'高雄市', 'kaohsiung'],
                 [ u'新竹縣', 'hsinchu'],
                 [ u'新竹市', 'hsinchu'],
                 [ u'花蓮縣', 'hualien'],
                 [ u'花蓮市', 'hualien'],
                 [ u'宜蘭縣', 'ilan'],
                 [ u'宜蘭市', 'ilan'],
                 [ u'金門縣', 'jinmen'],
                 [ u'金門市', 'jinmen'],
                 [ u'基隆縣', 'keelung'],
                 [ u'基隆市', 'keelung'],
                 [ u'馬祖縣', 'matsu'],
                 [ u'馬祖市', 'matsu'],
                 [ u'苗栗縣', 'miaoli'],
                 [ u'苗栗市', 'miaoli'],
                 [ u'南投縣', 'nantou'],
                 [ u'南投市', 'nantou'],
                 [ u'澎湖縣', 'penghu'],
                 [ u'澎湖市', 'penghu'],
                 [ u'屏東縣', 'pingtung'],
                 [ u'屏東市', 'pingtung'],
                 [ u'臺南縣', 'tainan'],
                 [ u'臺南市', 'tainan'],
                 [ u'臺東縣', 'taitung'],
                 [ u'臺東市', 'taitung'],
                 [ u'雲林縣', 'yunlin'],
                 [ u'雲林市', 'yunlin'],           
               ]
    for item in map_list:
        if word in item:
            return item[1]
    return None

if __name__=='__main__':
    print chtoeng(u'台北市')
