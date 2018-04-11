Instructions to create an LDA model using the Gensim Mallet wrapper

1. In the test.py file, change the specified chunk of code to iterate through the proper
   directories to get the articles to create the corpus
2. Run the test.py python file with the following command 
	
	python test.py

3. Depending on the size of the corpus, the file will take anywhere from a few minutes
   to many hours to run 
4. Once the model is created, the following files will have been created
	ldamodelmallet.lda
	documentMetadata.csv	(in the format: document #, path to the article, paperID, pubYear, pubMonth, pubDate, article title)
	AntiSlaveryTopics.txt 	(file with all of the topics and their relevancies)
	docTopics.txt		(file with all the topics and their relevancies specific to each of the documents)

5. Run topicModification.py with the following command
	
	python topicModification.py

   This takes the txt file of topics (AntiSlaveryTopics.txt) and converts it to a csv file (AntiSlaveryTopics.csv) in the format
	
	topic #, word, relevance of that word,..........

6. Run docTopicsModifications.py with the following command
	
	python docTopicsModifications.py

   This takes the txt file of all the document topics and converts it to a csv (docTopics.csv) in the following format
	
	topic #, relevance, topic #, relevance,............. (for the 1st document)
	topic #, relevance, topic #, relevance,............. (for the 2nd document)
	.
	.
	.
	topic #, relevance, topic #, relevance,............. (for the last document)
	

