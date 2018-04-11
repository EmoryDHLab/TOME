from gensim import corpora, models, utils
from collections import defaultdict
from pprint import pprint
import os
import re

documents = []

#Iterates through the directories to get the articles to make the model on
#Also creates a file that stores the metadata of the articles


numFound = 0
outerContents = os.listdir("coloredconventions")
for newspaper in outerContents:
	if ".txt" in newspaper:
		f = open('coloredconventions' + '/' + newspaper)
		documents.append(f.read())
		f.close()
		numFound += 1


print("=========================", numFound)

#The following code manipulates the corpus and then creates the LDA model from it


#Removes words from the stoplist
stoplist = set('for a of the and to in'.split())
texts = [[word for word in document.lower().split() if word not in stoplist] for document in documents]

texts = [[re.subn("[^a-zA-Z]+", '', word)[0] for word in doc if '-' not in word] for doc in texts]

all_tokens = sum(texts,[])

tokens_once = set(word for word in set(all_tokens) if all_tokens.count(word) == 1)

texts = [[word for word in text if word not in tokens_once] for text in texts]

id2word = corpora.Dictionary(texts)

#id2word.filter_extremes(5, 0.75, 100000)
#id2word.filter_n_most_frequent(500)
mm = [id2word.doc2bow(text) for text in texts]

print("right before lda")

#This is the function that creates the model and then saves it
lda = models.wrappers.LdaMallet("/usr/bin/Mallet/bin/mallet",mm, id2word= id2word, num_topics = 100)
lda.save('ldamodelmallet.lda')

x=lda.load_document_topics()

result = lda.show_topics(100, 10, formatted = False)

print(len(id2word))

#Writes the topics to a file

newFile = open("Colored_Conventions.txt", "w")

for each in result:
	newFile.write(str(each) + "\n")



#Writes the document topics to a file

gen = lda.read_doctopics(lda.fdoctopics())

newFile = open("Colored_Conventions_docTopics.txt", "w")

for i in gen:
	newFile.write(str(i) + "\n")
newFile.close()
