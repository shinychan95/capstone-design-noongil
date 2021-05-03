from __future__ import print_function, division

from facenet_pytorch import MTCNN, InceptionResnetV1, fixed_image_standardization, training
import torch
from torch.utils.data import DataLoader
from torchvision import datasets
import torchvision.transforms.functional as TF
import numpy as np
import pickle
import os
from PIL import Image

import warnings
warnings.filterwarnings("ignore")

workers = 0 if os.name == 'nt' else 4

device = torch.device('cuda:0' if torch.cuda.is_available() else 'cpu')

mtcnn = MTCNN(
    image_size=160, margin=0, min_face_size=20,
    thresholds=[0.6, 0.7, 0.7], factor=0.709,
    device=device
)

image = Image.open('C:\\github\\face-login-server\\data\\test\\test.jpeg')

resnet = InceptionResnetV1(pretrained='vggface2', classify=True).eval().to(device)

aligned, prob = mtcnn(image, return_prob=True)

aligned = torch.stack([aligned]).to(device)
embeddings = resnet(aligned).detach().cpu()

with open("C:\\github\\face-login-server\\ai\\classifier.pkl", 'rb') as infile:
    (model, names) = pickle.load(infile)

result = model.predict_proba(embeddings)
if max(result[0]) < 0.3:
    print("Unknown User")
    print("")
    print("probs: ", max(result[0]))
else:
    print(names[np.argmax(result[0])])
    print("")
    print("probs: ", max(result[0]))