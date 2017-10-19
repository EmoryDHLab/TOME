from gensim import corpora, models, utils
from collections import defaultdict
from pprint import pprint
import os
import re

documents = []

#The following block of commented code is to test the model on a smaller corpus

'''
f = open("thursday.txt")
documents.append(f.read())
f.close()

f = open("NationalAntiSlaveryStandard/18400827/001.txt")
documents.append(f.read())
f.close()

f = open("NationalAntiSlaveryStandard/18400827/002.txt")
documents.append(f.read())
f.close()

f = open("NationalAntiSlaveryStandard/18400827/003.txt")
documents.append(f.read())
f.close()

f = open("NationalAntiSlaveryStandard/18400827/004.txt")
documents.append(f.read())
f.close()

f = open("sunexposure.txt")
documents.append(f.read())
f.close()
#print(len(documents))


'''
#Iterates through the directories to get the articles to make the model on
#Also creates a file that stores the metadata of the articles

print("hi")
aFile = open("documentMetadata.csv", "w")

count=0
contents = os.listdir("NationalAntiSlaveryStandard")
numFound = 0
for content in contents:
	if content[0] == "1":
		subcontents = os.listdir("NationalAntiSlaveryStandard/" + content)
		for afile in subcontents:
			if "txt" in afile and count % 10 == 0:
				f = open("NationalAntiSlaveryStandard/" + content + "/" + afile)
				documents.append(f.read())
				f.close()
				newline = str(numFound) + ",NationalAntiSlaveryStandard/" + content + "/" + afile + ","
				mdfile = open("NationalAntiSlaveryStandard/" + content + "/" +  afile[:len(afile) - 3] + "md", "r")
				lines = mdfile.readlines()
				for line in lines:
					newline += line.split(", ")[1].strip("\n") + ","
				aFile.write(newline[:len(newline) - 1] + "\n")
				numFound += 1
			count += 1


print("=========================", numFound)

print("done")
#The following code manipulates the corpus and then creates the LDA model from it


#Removes words from the stoplist
stoplist = set('for a of the and to in'.split())
texts = [[word for word in document.lower().split() if word not in stoplist] for document in documents]

texts = [[re.subn("[^a-zA-Z]+", '', word)[0] for word in doc if '-' not in word] for doc in texts]

all_tokens = sum(texts,[])

tokens_once = set(word for word in set(all_tokens) if all_tokens.count(word) == 1)

texts = [[word for word in text if word not in tokens_once] for text in texts]

print("hi")

id2word = corpora.Dictionary(texts)
print(len(id2word))
#id2word.filter_extremes(5, 0.75, 100000)
id2word.filter_n_most_frequent(500)
mm = [id2word.doc2bow(text) for text in texts]

print("right before lda")

#This is the function that creates the model and then saves it
lda = models.wrappers.LdaMallet("/usr/bin/Mallet/bin/mallet",mm, id2word= id2word, num_topics = 100)
lda.save('ldamodelmallet.lda')

x=lda.load_document_topics()

result = lda.show_topics(100, 20, formatted = False)



#Writes the topics to a file

newFile = open("AntiSlaveryTopics_500.txt", "w")

for each in result:
	newFile.write(str(each) + "\n")



#Writes the document topics to a file

gen = lda.read_doctopics(lda.fdoctopics())

newFile = open("docTopics_500.txt", "w")

for i in gen:
	newFile.write(str(i) + "\n")
newFile.close()
