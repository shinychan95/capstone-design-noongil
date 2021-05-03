from __future__ import print_function, division

from facenet_pytorch import MTCNN, InceptionResnetV1, fixed_image_standardization, training
import torch
from torch.utils.data import DataLoader
from torchvision import datasets, transforms
import numpy as np
import pickle
import os


if "classifier.pkl" in os.listdir():
    os.remove("classifier.pkl")


