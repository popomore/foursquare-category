update:
	node index.js

publish:
	git co gh-pages
	git merge master
	git push origin gh-pages
	git co master
