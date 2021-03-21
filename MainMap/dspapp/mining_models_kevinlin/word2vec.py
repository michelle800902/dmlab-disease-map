# -*-coding:utf-8-*-
from warnings import filterwarnings
filterwarnings(action='ignore', category=UserWarning, module='gensim')

import os
import pickle
from gensim import *
from ch2eng_city import chtoeng
import traceback

def word2vec(board,query,project_root=""):
    try:
        w2v_path = os.path.join(project_root,'mining_models_kevinlin','word2vec_city', board + '_w2v.model')
        if not os.path.exists(w2v_path):
            board = chtoeng(board)
            w2v_path = os.path.join(project_root,'mining_models_kevinlin','word2vec_city', board + '_w2v.model')

        word2vec_model = models.Word2Vec.load(w2v_path)
        query = query.split()
        result_json = list()
        try:
            result = word2vec_model.most_similar(query[0],topn=10)
            for item in result:
                result_dict = {'word':item[0], 'size':float(item[1])}
                result_json.append(result_dict)
        except:
            result_json = None
        
        return result_json
    except:
        raise Exception(traceback.format_exc())        

if __name__=='__main__':
    result = word2vec('taichung',u'頭痛')
    for word in result:
        print word[0],word[1]
    
