#!/usr/bin/env bash

# This isnt really tested but Im going to keep it for documentation
# Based on:
# https://www.raspberryconnect.com/projects/65-raspberrypi-hotspot-accesspoints/158-raspberry-pi-auto-wifi-hotspot-switch-direct-connection

PACKAGES="hostapd dnsmasq"

apt-get install -y $PACKAGES

systemctl unmask hostapd
systemctl disable hostapd
systemctl disable dnsmasq

cp -v hostapd.conf /etc/hostapd/hostapd.conf
cp -v dnsmasq.conf /etc/dnsmasq.conf
cp -v autohotspot.service /etc/systemd/system/autohotspot.service
cp -v autohotspotN /usr/bin/autohotspotN

chmod +x /usr/bin/autohotspotN
echo "192.168.50.5 metar-map" >> /etc/hosts
echo "192.168.50.5 metar-map.local" >> /etc/hosts
echo 'DAEMON_CONF="/etc/hostapd/hostapd.conf"' >> /etc/default/hostapd


systemctl enable autohotspot.service
