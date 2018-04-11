from gensim import corpora, models, utils
from collections import defaultdict, Counter
from pprint import pprint
import os
import re

documents = []

#The following block of commented code is to test the model on a smaller corpus


#Iterates through the directories to get the articles to make the model on
#Also creates a file that stores the metadata of the articles

print("hi")
aFile = open("documentMetadata_FULL.csv", "w")

count=0
newspapers = os.listdir("accessible")
numFound = 0
for newspaper in newspapers:
	if newspaper != "TheCharlestonMercury-incomplete" and newspaper != 'VincennesCourant':
		contents = os.listdir("accessible/" + newspaper)	

		for content in contents:
			if content[0] == "1":
				subcontents = os.listdir("accessible/" + newspaper + "/"  + content)
				for afile in subcontents:
					if "txt" in afile:
						f = open("accessible/" + newspaper + "/" +  content + "/" + afile)
						documents.append(f.read())
						f.close()
						newline = str(numFound) + "," + newspaper + "/" + content + "/" + afile + ","
						mdfile = open("accessible/" + newspaper + "/" +  content + "/" +  afile[:len(afile) - 3] + "md", "r")
						lines = mdfile.readlines()
						for line in lines:
							newline += line.split(", ")[1].strip("\n") + ","
						aFile.write(newline[:len(newline) - 1] + "\n")
						numFound += 1
					count += 1


print("=========================", numFound)

print("done extracting words")
#The following code manipulates the corpus and then creates the LDA model from it


#Removes words from the stoplist
stoplist = set('for a of the and to in'.split())
texts = [[word for word in document.lower().split() if word not in stoplist] for document in documents]

texts = [[re.subn("[^a-zA-Z]+", '', word)[0] for word in doc if '-' not in word] for doc in texts]

all_tokens = sum(texts,[])

tokens_once = set(word for word in set(all_tokens) if all_tokens.count(word) == 1)

texts = [[word for word in text if word not in tokens_once] for text in texts]

frequency_texts = []
for doc in texts:
	for word in doc:
		frequency_texts.append(word)

frequencies = Counter(frequency_texts)
frequency_file = open('most_frequent_FULL.txt', 'w')
frequency_file.write('Total words: ' + str(len(frequencies.keys())) + '\n')
most_frequent = frequencies.most_common(500)

for word in most_frequent:
	frequency_file.write(word[0]+': '+ str(word[1]) +'\n')

frequency_file.close()

id2word = corpora.Dictionary(texts)


#id2word.filter_extremes(5, 0.75, 100000)
id2word.filter_n_most_frequent(100)
mm = [id2word.doc2bow(text) for text in texts]

print("right before lda")

#This is the function that creates the model and then saves it
lda = models.wrappers.LdaMallet("/usr/bin/Mallet/bin/mallet",mm, id2word= id2word, num_topics = 100)
lda.save('ldamodelmallet.lda')

x=lda.load_document_topics()

result = lda.show_topics(100, 100, formatted = False)



#Writes the topics to a file

newFile = open("AntiSlaveryTopics_FULL.txt", "w")

for each in result:
	newFile.write(str(each) + "\n")



#Writes the document topics to a file

gen = lda.read_doctopics(lda.fdoctopics())

newFile = open("docTopics_FULL", "w")

for i in gen:
	newFile.write(str(i) + "\n")
newFile.close()

