import os
import pickle
from ch2eng_city import chtoeng
import traceback




def clustering(board,epidemic,project_root=""):
    try:
        cluster_path = os.path.join(project_root,'mining_models_kevinlin','clustering',epidemic,board + '.pickle')
        if not os.path.exists(cluster_path):
            board = chtoeng(board)
            cluster_path = os.path.join(project_root,'mining_models_kevinlin','clustering',epidemic,board + '.pickle')
        with open(cluster_path,'r') as f:
            data = pickle.load(f)

        data_json = list()
        for item in data:
            data_dict = {'lat': item[0], 'lng': item[1], 'size': item[2], 'category': item[3]}
            data_json.append(data_dict)
        return data_json
    except:
        raise Exception(traceback.format_exc())
if __name__=='__main__':
    pass
