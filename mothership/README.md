# Mothership

The mothership provides a way for people to access their metar map dashboard via
a consistent address.

# Basics

Each metar map phones home with a uniq ID to the mothership.
We log the external IP, internal IP, uniq ID, and version.
When a user visits metar-map.rudelinux.org our custom DNS resolver
looks for an external IP that matches one in our DB. If found we
return the internal IP.
