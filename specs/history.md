## History file specs


### General Information
 - Uses the extension <code>.chf</code> (Citation History File)


### File Header
 - File id constant
 	- 32 bits / 4 bytes
 	- "CHF+"
 - File version
	- 16 bits / 2 bytes
 - File creation date
	- 32 bits / 4 bytes
 - Number of citations
	- 16 bits / 2 bytes
 - Number of containers
	- 16 bits / 2 bytes

<pre><code>
 0               1               2               3
 0 1 2 3 4 5 6 7 0 1 2 3 4 5 6 7 0 1 2 3 4 5 6 7 0 1 2 3 4 5 6 7  
+---------------------------------------------------------------+
|                 File identification constant                  |
|                             (32)                              |
+-------------------------------+-------------------------------+
|         Version number        |         Creation date         :
|              (16)             |             (32)              :
+-------------------------------+-------------------------------+
:         Creation date         |      Number of citations      |
:            (cont.)            |             (16)              |
+-------------------------------+-------------------------------+
|           Number of           |
|           containers          |
|              (16)             |
+-------------------------------+
</code></pre>


### File Body

<pre><code>
 0               1               2               3
 0 1 2 3 4 5 6 7 0 1 2 3 4 5 6 7 0 1 2 3 4 5 6 7 0 1 2 3 4 5 6 7  
+---------------+-----------------------------------------------+
| Citation list |
+---------------+-----------------------------------------------+
</code></pre>
