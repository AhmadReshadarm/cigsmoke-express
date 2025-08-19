Nmap scan report for puffmivape.com (144.126.145.113)
Host is up (0.21s latency).
rDNS record for 144.126.145.113: vmi984126.contaboserver.net
Not shown: 972 filtered tcp ports (no-response), 23 filtered tcp ports (host-prohibited), 2 filtered tcp ports (net-unreach)
PORT    STATE SERVICE   VERSION
22/tcp  open  ssh       OpenSSH 8.2p1 Ubuntu 4ubuntu0.13 (Ubuntu Linux; protocol 2.0)
| ssh2-enum-algos:
|   kex_algorithms: (10)
|   server_host_key_algorithms: (5)
|   encryption_algorithms: (6)
|   mac_algorithms: (10)
|_  compression_algorithms: (2)
| vulners:
|   cpe:/a:openbsd:openssh:8.2p1:
|       5E6968B4-DBD6-57FA-BF6E-D9B2219DB27A    10.0    https://vulners.com/githubexploit/5E6968B4-DBD6-57FA-BF6E-D9B2219DB27A  *EXPLOIT*
|       PACKETSTORM:173661      9.8     https://vulners.com/packetstorm/PACKETSTORM:173661      *EXPLOIT*
|       F0979183-AE88-53B4-86CF-3AF0523F3807    9.8     https://vulners.com/githubexploit/F0979183-AE88-53B4-86CF-3AF0523F3807  *EXPLOIT*
|       CVE-2023-38408  9.8     https://vulners.com/cve/CVE-2023-38408
|       B8190CDB-3EB9-5631-9828-8064A1575B23    9.8     https://vulners.com/githubexploit/B8190CDB-3EB9-5631-9828-8064A1575B23  *EXPLOIT*
|       8FC9C5AB-3968-5F3C-825E-E8DB5379A623    9.8     https://vulners.com/githubexploit/8FC9C5AB-3968-5F3C-825E-E8DB5379A623  *EXPLOIT*
|       8AD01159-548E-546E-AA87-2DE89F3927EC    9.8     https://vulners.com/githubexploit/8AD01159-548E-546E-AA87-2DE89F3927EC  *EXPLOIT*
|       2227729D-6700-5C8F-8930-1EEAFD4B9FF0    9.8     https://vulners.com/githubexploit/2227729D-6700-5C8F-8930-1EEAFD4B9FF0  *EXPLOIT*
|       0221525F-07F5-5790-912D-F4B9E2D1B587    9.8     https://vulners.com/githubexploit/0221525F-07F5-5790-912D-F4B9E2D1B587  *EXPLOIT*
|       CVE-2020-15778  7.8     https://vulners.com/cve/CVE-2020-15778
|       C94132FD-1FA5-5342-B6EE-0DAF45EEFFE3    7.8     https://vulners.com/githubexploit/C94132FD-1FA5-5342-B6EE-0DAF45EEFFE3  *EXPLOIT*
|       10213DBE-F683-58BB-B6D3-353173626207    7.8     https://vulners.com/githubexploit/10213DBE-F683-58BB-B6D3-353173626207  *EXPLOIT*
|       SSV:92579       7.5     https://vulners.com/seebug/SSV:92579    *EXPLOIT*
|       CVE-2020-12062  7.5     https://vulners.com/cve/CVE-2020-12062
|       1337DAY-ID-26576        7.5     https://vulners.com/zdt/1337DAY-ID-26576        *EXPLOIT*
|       CVE-2021-28041  7.1     https://vulners.com/cve/CVE-2021-28041
|       CVE-2021-41617  7.0     https://vulners.com/cve/CVE-2021-41617
|       PACKETSTORM:189283      6.8     https://vulners.com/packetstorm/PACKETSTORM:189283      *EXPLOIT*
|       F79E574D-30C8-5C52-A801-66FFA0610BAA    6.8     https://vulners.com/githubexploit/F79E574D-30C8-5C52-A801-66FFA0610BAA  *EXPLOIT*
|       CVE-2025-26465  6.8     https://vulners.com/cve/CVE-2025-26465
|       9D8432B9-49EC-5F45-BB96-329B1F2B2254    6.8     https://vulners.com/githubexploit/9D8432B9-49EC-5F45-BB96-329B1F2B2254  *EXPLOIT*
|       1337DAY-ID-39918        6.8     https://vulners.com/zdt/1337DAY-ID-39918        *EXPLOIT*
|       CVE-2023-51385  6.5     https://vulners.com/cve/CVE-2023-51385
|       CVE-2023-48795  5.9     https://vulners.com/cve/CVE-2023-48795
|       CVE-2020-14145  5.9     https://vulners.com/cve/CVE-2020-14145
|       CC3AE4FC-CF04-5EDA-A010-6D7E71538C92    5.9     https://vulners.com/githubexploit/CC3AE4FC-CF04-5EDA-A010-6D7E71538C92  *EXPLOIT*
|       54E1BB01-2C69-5AFD-A23D-9783C9D9FC4C    5.9     https://vulners.com/githubexploit/54E1BB01-2C69-5AFD-A23D-9783C9D9FC4C  *EXPLOIT*
|       CVE-2016-20012  5.3     https://vulners.com/cve/CVE-2016-20012
|       CVE-2025-32728  4.3     https://vulners.com/cve/CVE-2025-32728
|       CVE-2021-36368  3.7     https://vulners.com/cve/CVE-2021-36368
|_      PACKETSTORM:140261      0.0     https://vulners.com/packetstorm/PACKETSTORM:140261      *EXPLOIT*
|_banner: SSH-2.0-OpenSSH_8.2p1 Ubuntu-4ubuntu0.13
| ssh-hostkey:
|   4096 07:27:99:fe:fe:3a:9a:81:95:76:8a:9d:55:42:81:6b (RSA)
|   256 d0:d5:d3:67:88:42:bd:3c:75:fd:80:82:bd:6d:7b:72 (ECDSA)
|_  256 c4:ac:2b:e8:ce:c9:aa:06:61:c0:03:10:08:86:1f:b1 (ED25519)
80/tcp  open  http      nginx-rc
|_http-fetch: Please enter the complete path of the directory to save data in.
| fingerprint-strings:
|   GetRequest:
|     HTTP/1.1 404 Not Found
|     Server: nginx-rc
|     Date: Sat, 05 Jul 2025 09:20:47 GMT
|     Content-Type: text/html
|     Content-Length: 1091
|     Connection: close
|     Vary: Accept-Encoding
|     ETag: "6840f769-443"
|     <!DOCTYPE HTML><html><head><meta http-equiv="Content-Type" content="text/html; charset=utf-8" /><title>Website Unavailable</title><script>function goBack() { window.history.back() }</script><style type="text/css">body{ font-family:Arial, Helvetica, sans-serif;}.wrap{ width:1000px; margin:0 auto;}.logo{ width:430px; position:absolute; top:25%; left:35%;}h1 
{ font-size: 50px;}p a{ color:#eee; font-size:13px; padding:5px; background:#FF3366; text-decoration:none; -webkit-border-radius:.3em; -moz-border-radius:.3em; border-radius:.3em;}p 
a:hover{ color: #fff;}.footer{ position:absolute; bottom:10px; right:10px; font-size:12px; color:#aaa;}.footer a{ color:#666; text-decoration:none;}.text-center { text-
|   HTTPOptions:
|     HTTP/1.1 404 Not Found
|     Server: nginx-rc
|     Date: Sat, 05 Jul 2025 09:20:49 GMT
|     Content-Type: text/html
|     Content-Length: 1091
|     Connection: close
|     Vary: Accept-Encoding
|     ETag: "6840f769-443"
|_    <!DOCTYPE HTML><html><head><meta http-equiv="Content-Type" content="text/html; charset=utf-8" /><title>Website Unavailable</title><script>function goBack() { window.history.back() }</script><style type="text/css">body{ font-family:Arial, Helvetica, sans-serif;}.wrap{ width:1000px; margin:0 auto;}.logo{ width:430px; position:absolute; top:25%; left:35%;}h1 
{ font-size: 50px;}p a{ color:#eee; font-size:13px; padding:5px; background:#FF3366; text-decoration:none; -webkit-border-radius:.3em; -moz-border-radius:.3em; border-radius:.3em;}p 
a:hover{ color: #fff;}.footer{ position:absolute; bottom:10px; right:10px; font-size:12px; color:#aaa;}.footer a{ color:#666; text-decoration:none;}.text-center { text-
|_http-mobileversion-checker: No mobile version detected.
| http-useragent-tester:
|   Status for browser useragent: 200
|   Redirected To: http://www.puffmivape.com/
|   Allowed User Agents:
|     Mozilla/5.0 (compatible; Nmap Scripting Engine; https://nmap.org/book/nse.html)
|     libwww
|     lwp-trivial
|     libcurl-agent/1.0
|     PHP/
|     Python-urllib/2.5
|     GT::WWW
|     Snoopy
|     MFC_Tear_Sample
|     HTTP::Lite
|     PHPCrawl
|     URI::Fetch
|     Zend_Http_Client
|     http client
|     PECL::HTTP
|     Wget/1.13.4 (linux-gnu)
|_    WWW-Mechanize/1.34
|_http-server-header: nginx-rc
|_http-xssed: No previously reported XSS vuln.
| http-security-headers:
|   X_Frame_Options:
|     Header: X-Frame-Options: SAMEORIGIN
|     Description: The browser must not display this content in any frame from a page of different origin than the content itself.
|   X_XSS_Protection:
|     Header: X-XSS-Protection: 1; mode=block
|     Description: The browser will prevent the rendering of the page when XSS is detected.
|   X_Content_Type_Options:
|     Header: X-Content-Type-Options: nosniff
|     Description: Will prevent the browser from MIME-sniffing a response away from the declared content-type.
|   Cache_Control:
|_    Header: Cache-Control: no-cache, must-revalidate
|_http-title: Did not follow redirect to http://www.puffmivape.com/
|_http-referer-checker: Couldn't find any cross-domain scripts.
|_http-date: Sat, 05 Jul 2025 09:22:24 GMT; -2s from local time.
| http-headers:
|   Server: nginx-rc
|   Date: Sat, 05 Jul 2025 09:22:36 GMT
|   Content-Type: text/html
|   Content-Length: 174
|   Connection: close
|   Location: http://www.puffmivape.com/
|
|_  (Request type: GET)
|_http-comments-displayer: Couldn't find any comments.
443/tcp open  ssl/https nginx-rc
|_http-mobileversion-checker: No mobile version detected.
| fingerprint-strings:
|   FourOhFourRequest:
|     HTTP/1.1 301 Moved Permanently
|     Server: nginx-rc
|     Date: Sat, 05 Jul 2025 09:20:58 GMT
|     Content-Type: text/html
|     Content-Length: 174
|     Connection: close
|     Location: https://bwnailbrush.com/nice%20ports%2C/Tri%6Eity.txt%2ebak
|     Strict-Transport-Security: max-age=31536000
|     <html>
|     <head><title>301 Moved Permanently</title></head>
|     <body>
|     <center><h1>301 Moved Permanently</h1></center>
|     <hr><center>nginx-rc/1.27.1.2</center>
|     </body>
|     </html>
|   GetRequest:
|     HTTP/1.1 301 Moved Permanently
|     Server: nginx-rc
|     Date: Sat, 05 Jul 2025 09:20:56 GMT
|     Content-Type: text/html
|     Content-Length: 174
|     Connection: close
|     Location: https://bwnailbrush.com/
|     Strict-Transport-Security: max-age=31536000
|     <html>
|     <head><title>301 Moved Permanently</title></head>
|     <body>
|     <center><h1>301 Moved Permanently</h1></center>
|     <hr><center>nginx-rc/1.27.1.2</center>
|     </body>
|     </html>
|   HTTPOptions:
|     HTTP/1.1 301 Moved Permanently
|     Server: nginx-rc
|     Date: Sat, 05 Jul 2025 09:20:57 GMT
|     Content-Type: text/html
|     Content-Length: 174
|     Connection: close
|     Location: https://bwnailbrush.com/
|     Strict-Transport-Security: max-age=31536000
|     <html>
|     <head><title>301 Moved Permanently</title></head>
|     <body>
|     <center><h1>301 Moved Permanently</h1></center>
|     <hr><center>nginx-rc/1.27.1.2</center>
|     </body>
|     </html>
|   tor-versions:
|     HTTP/1.1 400 Bad Request
|     Server: nginx-rc
|     Date: Sat, 05 Jul 2025 09:21:00 GMT
|     Content-Type: text/html
|     Content-Length: 162
|     Connection: close
|     <html>
|     <head><title>400 Bad Request</title></head>
|     <body>
|     <center><h1>400 Bad Request</h1></center>
|     <hr><center>nginx-rc/1.27.1.2</center>
|     </body>
|_    </html>
|_http-referer-checker: Couldn't find any cross-domain scripts.
|_http-fetch: Please enter the complete path of the directory to save data in.
|_http-comments-displayer: Couldn't find any comments.
| http-headers:
|   Server: nginx-rc
|   Date: Sat, 05 Jul 2025 09:23:04 GMT
|   Content-Type: text/html
|   Content-Length: 174
|   Connection: close
|   Location: https://www.puffmivape.com/
|
|_  (Request type: GET)
| http-useragent-tester:
|   Status for browser useragent: 400
|   Allowed User Agents:
|     Mozilla/5.0 (compatible; Nmap Scripting Engine; https://nmap.org/book/nse.html)
|     libwww
|     libcurl-agent/1.0
|     PHP/
|     Python-urllib/2.5
|     Snoopy
|     MFC_Tear_Sample
|     URI::Fetch
|     Zend_Http_Client
|     http client
|     PECL::HTTP
|     Wget/1.13.4 (linux-gnu)
|     WWW-Mechanize/1.34
|   Forbidden/Redirected User Agents:
|     HTTP::Lite:
|       Different Host: https://www.puffmivape.com/
|     lwp-trivial:
|       Different Host: https://www.puffmivape.com/
|     GT::WWW:
|       Different Host: https://www.puffmivape.com/
|     PHPCrawl:
|_      Different Host: https://www.puffmivape.com/
|_http-server-header: nginx-rc
|_ssl-date: TLS randomness does not represent time
|_http-xssed: No previously reported XSS vuln.
| http-security-headers:
|   Strict_Transport_Security:
|_    HSTS not configured in HTTPS Server
|_http-date: Sat, 05 Jul 2025 09:22:02 GMT; -1s from local time.
|_http-title: 400 The plain HTTP request was sent to HTTPS port
2 services unrecognized despite returning data. If you know the service/version, please submit the following fingerprints at https://nmap.org/cgi-bin/submit.cgi?new-service :        
==============NEXT SERVICE FINGERPRINT (SUBMIT INDIVIDUALLY)==============
SF-Port80-TCP:V=7.97%I=7%D=7/5%Time=6868EE6F%P=i686-pc-windows-windows%r(G
SF:etRequest,503,"HTTP/1\.1\x20404\x20Not\x20Found\r\nServer:\x20nginx-rc\
SF:r\nDate:\x20Sat,\x2005\x20Jul\x202025\x2009:20:47\x20GMT\r\nContent-Typ
SF:e:\x20text/html\r\nContent-Length:\x201091\r\nConnection:\x20close\r\nV
SF:ary:\x20Accept-Encoding\r\nETag:\x20\"6840f769-443\"\r\n\r\n<!DOCTYPE\x
SF:20HTML><html><head><meta\x20http-equiv=\"Content-Type\"\x20content=\"te
SF:xt/html;\x20charset=utf-8\"\x20/><title>Website\x20Unavailable</title><
SF:script>function\x20goBack\(\)\x20{\x20window\.history\.back\(\)\x20}</s
SF:cript><style\x20type=\"text/css\">body{\x20font-family:Arial,\x20Helvet
SF:ica,\x20sans-serif;}\.wrap{\x20width:1000px;\x20margin:0\x20auto;}\.log
SF:o{\x20width:430px;\x20position:absolute;\x20top:25%;\x20left:35%;}h1\x2
SF:0{\x20font-size:\x2050px;}p\x20a{\x20color:#eee;\x20font-size:13px;\x20
SF:padding:5px;\x20background:#FF3366;\x20text-decoration:none;\x20-webkit
SF:-border-radius:\.3em;\x20-moz-border-radius:\.3em;\x20border-radius:\.3
SF:em;}p\x20a:hover{\x20color:\x20#fff;}\.footer{\x20position:absolute;\x2
SF:0bottom:10px;\x20right:10px;\x20font-size:12px;\x20color:#aaa;}\.footer
SF:\x20a{\x20color:#666;\x20text-decoration:none;}\.text-center\x20{\x20te
SF:xt-")%r(HTTPOptions,503,"HTTP/1\.1\x20404\x20Not\x20Found\r\nServer:\x2
SF:0nginx-rc\r\nDate:\x20Sat,\x2005\x20Jul\x202025\x2009:20:49\x20GMT\r\nC
SF:ontent-Type:\x20text/html\r\nContent-Length:\x201091\r\nConnection:\x20
SF:close\r\nVary:\x20Accept-Encoding\r\nETag:\x20\"6840f769-443\"\r\n\r\n<
SF:!DOCTYPE\x20HTML><html><head><meta\x20http-equiv=\"Content-Type\"\x20co
SF:ntent=\"text/html;\x20charset=utf-8\"\x20/><title>Website\x20Unavailabl
SF:e</title><script>function\x20goBack\(\)\x20{\x20window\.history\.back\(
SF:\)\x20}</script><style\x20type=\"text/css\">body{\x20font-family:Arial,
SF:\x20Helvetica,\x20sans-serif;}\.wrap{\x20width:1000px;\x20margin:0\x20a
SF:uto;}\.logo{\x20width:430px;\x20position:absolute;\x20top:25%;\x20left:
SF:35%;}h1\x20{\x20font-size:\x2050px;}p\x20a{\x20color:#eee;\x20font-size
SF::13px;\x20padding:5px;\x20background:#FF3366;\x20text-decoration:none;\
SF:x20-webkit-border-radius:\.3em;\x20-moz-border-radius:\.3em;\x20border-
SF:radius:\.3em;}p\x20a:hover{\x20color:\x20#fff;}\.footer{\x20position:ab
SF:solute;\x20bottom:10px;\x20right:10px;\x20font-size:12px;\x20color:#aaa
SF:;}\.footer\x20a{\x20color:#666;\x20text-decoration:none;}\.text-center\
SF:x20{\x20text-");
==============NEXT SERVICE FINGERPRINT (SUBMIT INDIVIDUALLY)==============
SF-Port443-TCP:V=7.97%T=SSL%I=7%D=7/5%Time=6868EE78%P=i686-pc-windows-wind
SF:ows%r(GetRequest,199,"HTTP/1\.1\x20301\x20Moved\x20Permanently\r\nServe
SF:r:\x20nginx-rc\r\nDate:\x20Sat,\x2005\x20Jul\x202025\x2009:20:56\x20GMT
SF:\r\nContent-Type:\x20text/html\r\nContent-Length:\x20174\r\nConnection:
SF:\x20close\r\nLocation:\x20https://bwnailbrush\.com/\r\nStrict-Transport
SF:-Security:\x20max-age=31536000\r\n\r\n<html>\r\n<head><title>301\x20Mov
SF:ed\x20Permanently</title></head>\r\n<body>\r\n<center><h1>301\x20Moved\
SF:x20Permanently</h1></center>\r\n<hr><center>nginx-rc/1\.27\.1\.2</cente
SF:r>\r\n</body>\r\n</html>\r\n")%r(HTTPOptions,199,"HTTP/1\.1\x20301\x20M
SF:oved\x20Permanently\r\nServer:\x20nginx-rc\r\nDate:\x20Sat,\x2005\x20Ju
SF:l\x202025\x2009:20:57\x20GMT\r\nContent-Type:\x20text/html\r\nContent-L
SF:ength:\x20174\r\nConnection:\x20close\r\nLocation:\x20https://bwnailbru
SF:sh\.com/\r\nStrict-Transport-Security:\x20max-age=31536000\r\n\r\n<html
SF:>\r\n<head><title>301\x20Moved\x20Permanently</title></head>\r\n<body>\
SF:r\n<center><h1>301\x20Moved\x20Permanently</h1></center>\r\n<hr><center
SF:>nginx-rc/1\.27\.1\.2</center>\r\n</body>\r\n</html>\r\n")%r(FourOhFour
SF:Request,1BC,"HTTP/1\.1\x20301\x20Moved\x20Permanently\r\nServer:\x20ngi
SF:nx-rc\r\nDate:\x20Sat,\x2005\x20Jul\x202025\x2009:20:58\x20GMT\r\nConte
SF:nt-Type:\x20text/html\r\nContent-Length:\x20174\r\nConnection:\x20close
SF:\r\nLocation:\x20https://bwnailbrush\.com/nice%20ports%2C/Tri%6Eity\.tx
SF:t%2ebak\r\nStrict-Transport-Security:\x20max-age=31536000\r\n\r\n<html>
SF:\r\n<head><title>301\x20Moved\x20Permanently</title></head>\r\n<body>\r
SF:\n<center><h1>301\x20Moved\x20Permanently</h1></center>\r\n<hr><center>
SF:nginx-rc/1\.27\.1\.2</center>\r\n</body>\r\n</html>\r\n")%r(tor-version
SF:s,136,"HTTP/1\.1\x20400\x20Bad\x20Request\r\nServer:\x20nginx-rc\r\nDat
SF:e:\x20Sat,\x2005\x20Jul\x202025\x2009:21:00\x20GMT\r\nContent-Type:\x20
SF:text/html\r\nContent-Length:\x20162\r\nConnection:\x20close\r\n\r\n<htm
SF:l>\r\n<head><title>400\x20Bad\x20Request</title></head>\r\n<body>\r\n<c
SF:enter><h1>400\x20Bad\x20Request</h1></center>\r\n<hr><center>nginx-rc/1
SF:\.27\.1\.2</center>\r\n</body>\r\n</html>\r\n");
Service Info: OS: Linux; CPE: cpe:/o:linux:linux_kernel

Host script results:
| port-states: 
|   tcp:
|     open: 22,80,443
|_    filtered: 1,3-4,6-7,9,13,17,19-21,23-26,30,32-33,37,42-43,49,53,70,79,81-85,88-90,99-100,106,109-111,113,119,125,135,139,143-144,146,161,163,179,199,211-212,222,254-256,259,264,280,301,306,311,340,366,389,406-407,416-417,425,427,444-445,458,464-465,481,497,500,512-515,524,541,543-545,548,554-555,563,587,593,616-617,625,631,636,646,648,666-668,683,687,691,700,705,711,714,720,722,726,749,765,777,783,787,800-801,808,843,873,880,888,898,900-903,911-912,981,987,990,992-993,995,999-1002,1007,1009-1011,1021-1100,1102,1104-1108,1110-1114,1117,1119,1121-1124,1126,1130-1132,1137-1138,1141,1145,1147-1149,1151-1152,1154,1163-1166,1169,1174-1175,1183,1185-1187,1192,1198-1199,1201,1213,1216-1218,1233-1234,1236,1244,1247-1248,1259,1271-1272,1277,1287,1296,1300-1301,1309-1311,1322,1328,1334,1352,1417,1433-1434,1443,1455,1461,1494,1500-1501,1503,1521,1524,1533,1556,1580,1583,1594,1600,1641,1658,1666,1687-1688,1700,1717-1721,1723,1755,1761,1782-1783,1801,1805,1812,1839-1840,1862-1864,1875,1900,1914,1935,1947,1971-1972,1974,1984,1998-2010,2013,2020-2022,2030,2033-2035,2038,2040-2043,2045-2049,2065,2068,2099-2100,2103,2105-2107,2111,2119,2121,2126,2135,2144,2160-2161,2170,2179,2190-2191,2196,2200,2222,2251,2260,2288,2301,2323,2366,2381-2383,2393-2394,2399,2401,2492,2500,2522,2525,2557,2601-2602,2604-2605,2607-2608,2638,2701-2702,2710,2717-2718,2725,2800,2809,2811,2869,2875,2909-2910,2920,2967-2968,2998,3000-3001,3003,3005-3006,3011,3017,3030-3031,3052,3071,3077,3128,3168,3211,3221,3260-3261,3268-3269,3283,3300-3301,3306,3322-3325,3333,3351,3367,3369-3372,3389-3390,3404,3476,3493,3517,3527,3546,3551,3580,3659,3689-3690,3703,3737,3766,3784,3800-3801,3809,3814,3826-3828,3851,3869,3871,3878,3880,3889,3905,3914,3918,3920,3945,3971,3986,3995,3998,4000-4006,4045,4111,4125-4126,4129,4224,4242,4279,4321,4343,4443-4446,4449,4550,4567,4662,4848,4899-4900,4998,5000-5004,5009,5030,5033,5050-5051,5054,5060-5061,5080,5087,5100-5102,5120,5190,5200,5214,5221-5222,5225-5226,5269,5280,5298,5357,5405,5414,5431-5432,5440,5500,5510,5544,5550,5555,5560,5566,5631,5633,5666,5678-5679,5718,5730,5800-5802,5810-5811,5815,5822,5825,5850,5859,5862,5877,5900-5904,5906-5907,5910-5911,5915,5922,5925,5950,5952,5959-5963,5985-5989,5998-6007,6009,6025,6059,6100-6101,6106,6112,6123,6129,6156,6346,6389,6502,6510,6543,6547,6565-6567,6580,6646,6666-6669,6689,6692,6699,6779,6788-6789,6792,6839,6881,6901,6969,7000-7002,7004,7007,7019,7025,7070,7100,7103,7106,7200-7201,7402,7435,7443,7496,7512,7625,7627,7676,7741,7777-7778,7800,7911,7920-7921,7937-7938,7999-8002,8007-8011,8021-8022,8031,8042,8045,8080-8090,8093,8099-8100,8180-8181,8192-8194,8200,8222,8254,8290-8292,8300,8333,8383,8400,8402,8443,8500,8600,8649,8651-8652,8654,8701,8800,8873,8888,8899,8994,9000-9003,9009-9011,9040,9050,9071,9080-9081,9090-9091,9099-9103,9110-9111,9200,9207,9220,9290,9415,9418,9485,9500,9502-9503,9535,9575,9593-9595,9618,9666,9876-9878,9898,9900,9917,9929,9943-9944,9968,9998-10004,10009-10010,10012,10024-10025,10082,10180,10215,10243,10566,10616-10617,10621,10626,10628-10629,10778,11110-11111,11967,12000,12174,12265,12345,13456,13722,13782-13783,14000,14238,14441-14442,15000,15002-15004,15660,15742,16000-16001,16012,16016,16018,16080,16113,16992-16993,17877,17988,18040,18101,18988,19101,19283,19315,19350,19780,19801,19842,20000,20005,20031,20221-20222,20828,21571,22939,23502,24444,24800,25734-25735,26214,27000,27352-27353,27355-27356,27715,28201,30000,30718,30951,31038,31337,32768-32785,33354,33899,34571-34573,35500,38292,40193,40911,41511,42510,44176,44442-44443,44501,45100,48080,49152-49161,49163,49165,49167,49175-49176,49400,49999-50003,50006,50300,50389,50500,50636,50800,51103,51493,52673,52822,52848,52869,54045,54328,55055-55056,55555,55600,56737-56738,57294,57797,58080,60020,60443,61532,61900,62078,63331,64623,64680,65000,65129,65389
| resolveall:
|   Host 'puffmivape.com' also resolves to:
|   Use the 'newtargets' script-arg to add the results as targets
|_  Use the --resolve-all option to scan all resolved addresses without using this script.
| qscan:
| PORT  FAMILY  MEAN (us)  STDDEV     LOSS (%)
| 22    0       445900.00  494178.88  0.0%
| 80    0       338600.00  304348.19  0.0%
|_443   0       391300.00  380601.88  0.0%
|_path-mtu: PMTU == 1500
|_ipidseq: All zeros
|_clock-skew: mean: -1s, deviation: 0s, median: -2s
| whois-domain:
|
| Domain name record found at whois.verisign-grs.com
|    Domain Name: PUFFMIVAPE.COM\x0D
|    Registry Domain ID: 2614498714_DOMAIN_COM-VRSN\x0D
|    Registrar WHOIS Server: grs-whois.hichina.com\x0D
|    Registrar URL: http://www.net.cn\x0D
|    Updated Date: 2024-04-24T04:23:25Z\x0D
|    Creation Date: 2021-05-24T08:35:23Z\x0D
|    Registry Expiry Date: 2029-05-24T08:35:23Z\x0D
|    Registrar: Alibaba Cloud Computing (Beijing) Co., Ltd.\x0D
|    Registrar IANA ID: 420\x0D
|    Registrar Abuse Contact Email: DomainAbuse@service.aliyun.com\x0D
|    Registrar Abuse Contact Phone: +86.95187\x0D
|    Domain Status: ok https://icann.org/epp#ok\x0D
|    Name Server: DNS29.HICHINA.COM\x0D
|    Name Server: DNS30.HICHINA.COM\x0D
|    DNSSEC: unsigned\x0D
|    URL of the ICANN Whois Inaccuracy Complaint Form: https://www.icann.org/wicf/\x0D
| >>> Last update of whois database: 2025-07-05T09:21:39Z <<<\x0D
| \x0D
| For more information on Whois status codes, please visit https://icann.org/epp\x0D
| \x0D
| NOTICE: The expiration date displayed in this record is the date the\x0D
| registrar's sponsorship of the domain name registration in the registry is\x0D
| currently set to expire. This date does not necessarily reflect the expiration\x0D
| date of the domain name registrant's agreement with the sponsoring\x0D
| registrar.  Users may consult the sponsoring registrar's Whois database to\x0D
| view the registrar's reported date of expiration for this registration.\x0D
| \x0D
| TERMS OF USE: You are not authorized to access or query our Whois\x0D
| database through the use of electronic processes that are high-volume and\x0D
| automated except as reasonably necessary to register domain names or\x0D
| modify existing registrations; the Data in VeriSign Global Registry\x0D
| Services' ("VeriSign") Whois database is provided by VeriSign for\x0D
| information purposes only, and to assist persons in obtaining information\x0D
| about or related to a domain name registration record. VeriSign does not\x0D
| guarantee its accuracy. By submitting a Whois query, you agree to abide\x0D
| by the following terms of use: You agree that you may use this Data only\x0D
| for lawful purposes and that under no circumstances will you use this Data\x0D
| to: (1) allow, enable, or otherwise support the transmission of mass\x0D
| unsolicited, commercial advertising or solicitations via e-mail, telephone,\x0D
| or facsimile; or (2) enable high volume, automated, electronic processes\x0D
| that apply to VeriSign (or its computer systems). The compilation,\x0D
| repackaging, dissemination or other use of this Data is expressly\x0D
| prohibited without the prior written consent of VeriSign. You agree not to\x0D
| use electronic processes that are automated and high-volume to access or\x0D
| query the Whois database except as reasonably necessary to register\x0D
| domain names or modify existing registrations. VeriSign reserves the right\x0D
| to restrict your access to the Whois database in its sole discretion to ensure\x0D
| operational stability.  VeriSign may restrict or terminate your access to the\x0D
| Whois database for failure to abide by these terms of use. VeriSign\x0D
| reserves the right to modify these terms at any time.\x0D
| \x0D
| The Registry database contains ONLY .COM, .NET, .EDU domains and\x0D
|_Registrars.\x0D
| asn-query:
| BGP: 144.126.144.0/22 | Country: US
|   Origin AS: 40021 - NL-811-40021, US
|_    Peer AS: 174 3356
| ip-geolocation-geoplugin: coordinates: 47.3066, -122.2619
|_location: Washington, United States
| whois-ip: Record found at whois.arin.net
| netrange: 144.126.128.0 - 144.126.159.255
| netname: CONTA-48
| orgname: Contabo Inc.
| orgid: CONTA-48
|_country: US stateprov: MO
|_fcrdns: PASS (vmi984126.contaboserver.net)

Post-scan script results:
Bug in ip-geolocation-map-kml: no string output.
Bug in ip-geolocation-map-bing: no string output.
| reverse-index:
|   22/tcp: 144.126.145.113
|   80/tcp: 144.126.145.113
|_  443/tcp: 144.126.145.113
Bug in ip-geolocation-map-google: no string output.
Service detection performed. Please report any incorrect results at https://nmap.org/submit/ .
Nmap done: 1 IP address (1 host up) scanned in 507.70 seconds



gobuster dir -u https://www.puffmivape.com -w C:\wordlists\common.txt -x php -t 30 -k -o wp_scan.txt

nmap -sV 144.126.145.113