from __future__ import print_function, division

from facenet_pytorch import MTCNN, InceptionResnetV1, fixed_image_standardization, training
import torch
from torch.utils.data import DataLoader
from torchvision import datasets, transforms
import numpy as np
import pickle
import os

import warnings
warnings.filterwarnings("ignore")

workers = 0 if os.name == 'nt' else 4

device = torch.device('cuda:0' if torch.cuda.is_available() else 'cpu')

def collate_fn(x):
    return x[0]

trans = transforms.Compose([
    transforms.RandomHorizontalFlip(),
    transforms.RandomGrayscale(p=0.6)
])

dataset = datasets.ImageFolder("C:\\github\\face-login-server\\data\\train", transform=trans)
dataset.idx_to_class = {i:c for c, i in dataset.class_to_idx.items()}
loader = DataLoader(dataset, collate_fn=collate_fn, num_workers=workers)

mtcnn = MTCNN(
    image_size=160, margin=0, min_face_size=20,
    thresholds=[0.6, 0.7, 0.7], factor=0.709,
    device=device
)

aligned = []
indexes  = []
names = []

for x, y in loader:
    x_aligned, prob = mtcnn(x, return_prob=True)
    if x_aligned is not None:
        aligned.append(x_aligned)
        indexes.append(y)
        names.append(dataset.idx_to_class[y])


resnet = InceptionResnetV1(pretrained='vggface2', classify=True).eval().to(device)

aligned = torch.stack(aligned).to(device)
embeddings = resnet(aligned).detach().cpu()

from sklearn import svm

clf = svm.SVC(kernel='linear', probability=True)
clf.fit(embeddings.tolist(), indexes)

if "classifier.pkl" in os.listdir():
    os.remove("classifier.pkl")

if "classifier.pkl" in os.listdir():
    os.remove("classifier.pkl")

with open("C:\\github\\face-login-server\\ai\\classifier.pkl", 'wb') as outfile:
    pickle.dump((clf, dataset.idx_to_class), outfile)
