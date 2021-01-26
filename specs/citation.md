## History file specs


### Element Lists
 - Element length
	- 8 bits / 1 byte
	- Interpreted as bytes
 - Element data
	- Up to 255 bytes
 - [Repeat as needed]

<pre><code>
 0               1
 0 1 2 3 4 5 6 7 0 1 2 3 4 5 6 7
+---------------+---------------+
|    Element    | Element data  |
|    length     | (up to 2040)  |
|      (8)      |               |
+---------------+---------------+
</code></pre>


### Citation Header
 - Total citation length
	- 16 bits / 2 bytes
	- Length (in bits) of the entire citation
 - Format name length
	- 8 bits
	- Interpreted as bytes
 - Format name
	- Up to 255 bytes
 - Citation name length
	- 8 bits
	- Interpreted as bytes
 - Citation name
	- Up to 255 bytes
 - Date created
	- 32 bits / 4 bytes
 - Date modified
	- 32 bits / 4 bytes
 - Number of containers
	- 8 bits / 1 byte
 - Container list
	- Up to many, many bytes
	- Each container is a string

<pre><code>
 0               1               2               3
 0 1 2 3 4 5 6 7 0 1 2 3 4 5 6 7 0 1 2 3 4 5 6 7 0 1 2 3 4 5 6 7
+-------------------------------+---------------+---------------+
|     Total citation length     |  Format name  |  Format name  |
|              (16)             |     length    |  (up to 2040) |
|                               |      (8)      |               |
+---------------+---------------+---------------+---------------+
| Citation name | Citation name |         Date created          :
|     length    |  (up to 2040) |             (32)              :
|      (8)      |               |                               :
+---------------+---------------+-------------------------------+
:         Date created          |         Date modified         :
:            (cont.)            |             (32)              :
+-------------------------------+---------------+---------------+
:         Date modified         |   Number of   |   Container   |
:            (cont.)            |   containers  |     list      |
:                               |      (8)      |               |
+-------------------------------+---------------+---------------+
</code></pre>


### Citation Body
 - Title length
	- 8 bits
	- Interpreted as bytes
 - Title
	- Up to 255 bytes
 - URL length
	- 16 bits
	- Interpreted as bits
 - URL
	- Up to 8192 bytes
 - Number of authors
	- 8 bits
 - Author list
	- Up to many, many bytes
	- Each author is a list of 4 elements
		- Prefix, First, Middle, Last
 - Number of publishers
	- 8 bits
 - Publisher list
	- Up to many, many bytes
	- Each publisher is a string
 - Publish date
	- 32 bits / 4 bytes
 - Access date
	- 32 bits / 4 bytes

<pre><code>
 0               1               2               3
 0 1 2 3 4 5 6 7 0 1 2 3 4 5 6 7 0 1 2 3 4 5 6 7 0 1 2 3 4 5 6 7
+---------------+---------------+-------------------------------+
| Title length  |     Title     |           URL length          |
|      (8)      | (up to 2040)  |              (16)             |
+---------------+---------------+---------------+---------------+
|      URL      |   Number of   |  Author list  |   Number of   |
| (up to 65535) |    authors    |               |   publishers  |
|               |      (8)      |               |      (8)      |
+---------------+---------------+---------------+---------------+
|   Publisher   |                  Publish date                 :
|     list      |                      (32)                     :
+---------------+-----------------------------------------------+
: Publish date  |                  Access date                  :
:    (cont.)    |                      (32)                     :
+---------------+-----------------------------------------------+
:  Access date  |
:    (cont.)    |
+---------------+
</code></pre>
