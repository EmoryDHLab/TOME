from gensim import corpora, models, utils
from collections import defaultdict
from pprint import pprint
import os

lda = load("ldamodelmallet.lda")
result = lda.show_topics(10, 5, formatted = False)
for each in result:
	print each
print('done')
gen = lda.read_doctopics(lda.fdoctopics())
for i in gen:
	print(i)
