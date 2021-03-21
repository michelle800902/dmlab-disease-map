# -*-coding:utf-8-*-

import os
import cPickle as pickle
import traceback
from ch2eng_city import chtoeng
from gensim import *
import operator
def search_documents(board,word,topic_number,project_root=""):
    try:
        search_path = os.path.join(project_root,'mining_models_kevinlin','segment_city', board + '.pickle')
        search_path2 = os.path.join(project_root,'mining_models_kevinlin','dictionary_city', board + '.dict')
        search_path3 = os.path.join(project_root,'mining_models_kevinlin','lda_city', board + '_lda.model')
        if not os.path.exists(search_path):
            board = chtoeng(board)
            search_path = os.path.join(project_root,'mining_models_kevinlin','segment_city', board + '.pickle')
            search_path2 = os.path.join(project_root,'mining_models_kevinlin','dictionary_city', board + '.dict')
            search_path3 = os.path.join(project_root,'mining_models_kevinlin','lda_city', board + '_lda.model')
        with open(search_path,'rb') as f:
            segment,document_index = pickle.load(f)
        num_topic = int(topic_number)
        require_index = list()
        require_document = list()
        for i,doc in enumerate(segment):
            if word in doc:
                require_index.append(document_index[i].split('.')[0])
                require_document.append(segment[i])
        
        filter_index = list()
        gensim_dictionary = corpora.Dictionary.load(search_path2)
        lda = models.LdaModel.load(search_path3)
        for i,doc in enumerate(require_document):
            new_dict = gensim_dictionary.doc2bow(doc)
            lda_dis = lda[new_dict]
            max_lda = max(lda_dis, key=operator.itemgetter(1))
            if max_lda[0] == num_topic:
                print max_lda
                print lda_dis
                filter_index.append(require_index[i])            
        return filter_index
    except:
        raise Exception(traceback.format_exc())

if __name__=='__main__':
    index = search_documents('taichung',u'月')
    print index[0]
