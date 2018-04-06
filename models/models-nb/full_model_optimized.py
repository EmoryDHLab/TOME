from gensim import corpora, models, utils
from collections import defaultdict, Counter
from pprint import pprint
import os
import re


aFile = open("documentMetadata_FULL.csv", "w")



def iter_documents(top_directory):
	numFound = 0
	for root,dirs,files in os.walk(top_directory):
		for dir1 in filter(lambda newspaper: newspaper != "TheCharlestonMercury-incomplete" and newspaper != "VincennesCourant" , dirs):
		#for dir1 in filter(lambda newspaper: newspaper == "TheCharlestonMercury-incomplete" or newspaper == "VincennesCourant" , dirs):
			#print(dir1)
			for root2, dirs2,files2 in os.walk(top_directory + "/" + dir1):
				#print(files2)
				for dir2 in dirs2:
					for root3, dirs3, files3 in os.walk(top_directory + "/" + dir1 + "/" +  dir2):
						for file1 in filter(lambda filee: filee.endswith('.txt'),files3):
							#print('hi')
							document = open(os.path.join(root,dir1, dir2,file1)).read()
							newline = str(numFound) + "," + dir1 + "/" + dir2 + "/" + file1 + ","
							mdfile = open("accessible/" + dir1 + "/" +  dir2 + "/" +  file1[:len(file1) - 3] + "md", "r")
							lines = mdfile.readlines()
							for line in lines:
								newline += line.split(", ")[1].strip("\n") + ","
							aFile.write(newline[:len(newline) - 1] + "\n")
							stoplist = set('for a of the and to in'.split())
							resultwords = [word for word in document.split() if word.lower() not in stoplist]
							result = ' '.join(resultwords)
													
							cleanedwords = [re.subn("[^a-zA-Z]+", ' ', word)[0] for word in result if '-' not in word]
							resultfinal = ''.join(cleanedwords)
							words = [word.strip() for word in resultfinal.split()]
							final = ' '.join(words)
							numFound += 1
							yield utils.tokenize(resultfinal, lower=True)
class MyCorpus(object):
	def __init__(self, top_dir):
		self.top_dir = top_dir
		self.dictionary = corpora.Dictionary(iter_documents(top_dir))
		self.dictionary.filter_n_most_frequent(100)
		#self.dictionary = [[word for word in key.lower() if word not in stoplist] for key in self.dictionary]

	def __iter__(self):
		for tokens in iter_documents(self.top_dir):
			yield self.dictionary.doc2bow(tokens)

corpus = MyCorpus('accessible')
print('done')
print('done taking out stop words')
id2word = corpus.dictionary
print(id2word)


print("right before lda")

#This is the function that creates the model and then saves it
lda = models.wrappers.LdaMallet("/usr/bin/Mallet/bin/mallet",corpus, id2word= id2word, num_topics = 100, workers = 2)
lda.save('ldamodelmallet-optimized1.lda')

x=lda.load_document_topics()

result = lda.show_topics(100, 100, formatted = False)



#Writes the topics to a file

newFile = open("all_newspapers_topics1.txt", "w")

for each in result:
	newFile.write(str(each) + "\n")



#Writes the document topics to a file

gen = lda.read_doctopics(lda.fdoctopics())

newFile = open("all_newspapers_doc_topics1.txt", "w")

for i in gen:
	newFile.write(str(i) + "\n")
newFile.close()

