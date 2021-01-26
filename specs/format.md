## Format file specs


### General Information
 - Uses the extension <code>.fmt</code> (Format abbreviation)


### Element Indices
 - 0: Title
 - 1: Url
 - 2: Authors
 - 3: Publishers
 - 4: Publish date
 - 5: Access date


### Element Properties
 - Each property's number represents which bit (lowest first) is set
	- Multiple bits can be set at once
 - Title
	- N/A
 - Url
	- 0: Remove the protocol (http[s]://example.com -> example.com)
	- 1: Get the base address (http[s]://example.com/path -> example.com)
 - Authors
	- 0: Only the first author
	- 1: Only prefixes
	- 2: Only first names
	- 3: Only middle names
	- 4: Only last names
 - Publishers
	- 0: Only the first publisher
 - Publish date
	- 0: Only the day
	- 1: Only the month
	- 2: Only the year
 - Access date
	- 0: Only the day
	- 1: Only the month
	- 2: Only the year


### Individual Formats
 - Total format length
	- 16 bits / 2 bytes
	- Length (in bits) of the entire format
 - Format name length
	- 8 bits
	- Interpreted as bytes
 - Format name
	- Up to 255 bytes
 - Format settings
	- 8 bits
	- Use indentation
		- 1 bit
		- 1 = yes, 0 = no
 - Block amount
	- 8 bits
	- Amount of blocks in the format
 - Block type
	- 1 bit
	- 1 = element, 0 = text
 - Block type or length
	- 7 bits
	- Interpreted as an index (if type)
	- Interpreted as bytes (if length)
 - Block data
 - Repeat from <code>Block type</code> as necessary

<pre><code>
 0               1               2               3
 0 1 2 3 4 5 6 7 0 1 2 3 4 5 6 7 0 1 2 3 4 5 6 7 0 1 2 3 4 5 6 7  
+-------------------------------+---------------+---------------+
|      Total format length      |  Format name  |  Format name  |
|             (16)              |     length    |               |
|                               |      (8)      |               |
+-+-------------+---------------+-+-------------+---------------+
|I|  [Unused]   |  Block amount |T|  Block type |   Block data  |
|N|             |      (8)      |Y|  or length  |               |
|D|             |               |P|     (7)     |               |
|T|             |               |E|             |               |
+-+-------------+---------------+-+-------------+---------------+
</code></pre>


### Element Block Data
 - Element options
	- 8 bits
 - Preceding data length
	- 8 bits
	- Interpreted as bytes
 - Preceding data
	- Plain text that comes before the element
 - Succeeding data length
	- 8 bits
	- Interpreted as bytes
 - Succeeding data
	- Plain text that comes after the element

<pre><code>
 0               1               2               3
 0 1 2 3 4 5 6 7 0 1 2 3 4 5 6 7 0 1 2 3 4 5 6 7 0 1 2 3 4 5 6 7  
+---------------+---------------+---------------+---------------+
|    Element    |   Preceding   |   Preceding   |  Succeeding   |
|    options    |  data length  |     data      |  data length  |
|      (8)      |      (8)      |               |      (8)      |
+---------------+---------------+---------------+---------------+
|  Succeeding   |
|     data      |
+---------------+
</code></pre>


### File Header
 - File id constant
 	- 32 bits / 4 bytes
 	- "FMT+"
 - File version
	- 16 bits / 2 bytes
 - Number of formats
	- 16 bits / 2 bytes

<pre><code>
 0               1               2               3
 0 1 2 3 4 5 6 7 0 1 2 3 4 5 6 7 0 1 2 3 4 5 6 7 0 1 2 3 4 5 6 7  
+---------------------------------------------------------------+
|                 File identification constant                  |
|                             (32)                              |
+-------------------------------+-------------------------------+
|         Version number        |       Number of formats       |
|              (16)             |             (16)              |
+-------------------------------+-------------------------------+
</code></pre>


### File Body

<pre><code>
 0               1               2               3
 0 1 2 3 4 5 6 7 0 1 2 3 4 5 6 7 0 1 2 3 4 5 6 7 0 1 2 3 4 5 6 7  
+---------------+-----------------------------------------------+
|  Format list  |
+---------------+-----------------------------------------------+
</code></pre>
