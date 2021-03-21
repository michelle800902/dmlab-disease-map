# -*-coding:utf-8-*-
from warnings import filterwarnings
filterwarnings(action='ignore', category=UserWarning, module='gensim')

import traceback
from ch2eng_city import chtoeng
import os
import pickle
from gensim import *
import json

def topic_modeling(board,project_root=""):
    try:
        lda_path = os.path.join(project_root,'mining_models_kevinlin','lda_city', board + '_lda.model')
        if not os.path.exists(lda_path):
            board = chtoeng(board)
            print board
            lda_path = os.path.join(project_root,'mining_models_kevinlin','lda_city', board + '_lda.model')            
        lda = models.LdaModel.load(lda_path)
        topics = lda.show_topics(num_words=10,num_topics=-1,formatted=False)
        # print len(topics)

        word_json = list()    
        for topic in topics:
            category = topic[0]
            words = topic[1]    
            for word in words:
                word_dict = {'word': word[0],'word_size':float(word[1]),'category':category}
                word_json.append(word_dict)
        return word_json
    except:
        raise Exception(traceback.format_exc())
if __name__=='__main__':
    words = topic_modeling('taichung')
    for topic in words:
        for word in topic:
            print word[0],word[1]
        print "===================="

    
