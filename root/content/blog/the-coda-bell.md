---
title: The Coda Bell
createdAt: Nov 8, 2017 PST
image: /images/blog/the-coda-bell/bell_final.jpg
snippet: >
  A few weeks ago, I got to be part of something special: the launch of Coda. To add a little ceremony to the occasion (it's not every day...
---

A few weeks ago, I got to be part of something special: the launch of [Coda](https://blog.coda.io/its-a-new-day-for-docs-2643fb16f05a). To add a little ceremony to the occasion (it’s not every day you get to launch a company!), my coworker Chris Eck and I rigged up an old call bell to ring every time someone signed up. Here’s what it looked like:

<tweet id="922964153605558272"></tweet>

One of our product managers, Matt Hudson, actually deserves credit for the whole idea. He had a [call bell](https://www.amazon.com/gp/product/B001B095E0/) lying around, so we just needed to pick up a few extra parts and go from there. This post goes into how we built the Coda Bell.

# Parts and Equipment

The most important part of a project like this is the brains — the microcontroller. I’ve personally used a bunch, ranging from a Raspberry Pi (one of the smallest Linux boxes out there) to an ESP8266 (awesome cheap WiFi chip!), but for the purpose of this project, we decided to go with a [Particle Photon](https://www.particle.io/products/hardware/photon-wifi-dev-kit), for its excellent out-of-the-box cloud integration (we didn’t have a lot of time to mess with the TCP stack).

There wasn’t too much hardware complexity in the remaining parts: we just used an [SG90 servo](http://akizukidenshi.com/download/ds/towerpro/SG90.pdf), an [enclosure](https://www.amazon.com/gp/product/B0734ZLSQG) off Amazon, some wires and spare electronics parts, and a breadboard. No soldering necessary!

# From Cloud to Device

When we noticed that Particle [supported IFTTT](https://docs.particle.io/guide/tools-and-features/ifttt/) (IF This Then That), we knew there was no chance we’d bother with polling our servers or dealing with interrupts for something like this. Instead, we went on IFTTT and configured the [Webhooks service](https://ifttt.com/maker_webhooks), linked our [Particle account](https://ifttt.com/particle), and created a simple applet to publish a private _signup_ event to the Particle Cloud every time the webhook URL was hit, which we’d set up to happen when someone signed up.

<figure><img src="/images/blog/the-coda-bell/ifttt.png" alt="IFTTT" /></figure>

The Webhooks service supports passing in a few values, so we set the data of the Particle event to:

```json
{{OccurredAt}}
{{Value1}}
{{Value2}}
{{Value3}}
```

## Testing the IFTTT Applet

Now, to test that it worked, we used the _particle-cli_ Node package to listen to the event:

```sh
$ particle subscribe signup mine
Subscribing to "signup" from my personal stream (my devices only)
Listening to: /v1/devices/events/signup
```

We then got the webhook URL from the Webhook service settings in IFTTT (e.g., <https://maker.ifttt.com/trigger/signup/with/key/foo>), and fired up [Postman](https://chrome.google.com/webstore/detail/postman/fhbjgbiflinjbdggehcddcbncdddomop?hl=en) to POST to that URL with _{“value1”: “123”}_. A few seconds later, the message showed up.

# Putting the Circuit Together

The whole project ended up being relatively straightforward with these components.

<figure>
  <img src="/images/blog/the-coda-bell/schematic.png" alt="Schematic for bell" />
  <figcaption>Coda Bell schematic. Components connected by a dotted line are in practice optional.</figcaption>
</figure>

When powering the Photon via USB, pin 1 supplies 4.8 V, which is in line with the operating voltage of the servo. The bypass capacitor _C1_ and bleeder resistor _R2_ in parallel with the servo act as a reservoir of energy for the power-hungry motor, which may otherwise behave erratically and draw too much current, while the _D1_ and _R1_ at the bottom are there for blinking a status LED.

# Making the Bell Ring

The servo came with a few attachments, which we jerry-rigged to create a lever that swings to knock the clapper of the bell into the metal bowl. We then used epoxy to secure the servo in place.

<figure>
  <img src="/images/blog/the-coda-bell/bell_underside.jpg" alt="Schematic for bell" />
  <figcaption>Underside of the bell, showing the mechanics of the servo ringing it.</figcaption>
</figure>

# Writing the Firmware

With the hardware out of the way, it was time to actually hook this thing up! Here’s the code:

<client-only>
  <gist gist-id="763dd937f29c3ccc6bfdb3ed6a768b67" file="coda-bell.c"></gist>
</client-only>

This was mostly straightforward, but there are a couple things worth pointing out:

## Servo Library

Particle ships with a [servo library](https://docs.particle.io/reference/firmware/photon/#servo), which handled sending a pulse-width modulation (PWM) signal to the motor for us. We just tell it what position (in degrees) to go to, delay as needed, and it does the rest.

## IFTTT

Thanks to [Particle Cloud](https://docs.particle.io/reference/firmware/photon/#particle-subscribe-), listening to the webhook was as easy as calling _Particle.subscribe(“signup”, onIfttt, MY_DEVICES)_. Our handler here assumes that the second line of the message contains an integer with the number of signups that have occurred since the last event, and the main loop handles consuming this count and ringing that number of times.

Since user signups can be viewed as a [Poisson process](http://www.rle.mit.edu/rgallager/documents/6.262lateweb2.pdf), we wanted to make sure that the bell is able to cope with sudden bursts of people signing up, and this approach established a queue of sorts for ringing the bell. We put the counting logic in a critical section (via _ATOMIC_BLOCK()_) to make sure there weren’t any race conditions between writing and reading the count.

# Finishing Touches

The last part of the puzzle was getting the server to hit the webhook URL when users signed up. We decided to throttle to 5 seconds to avoid overwhelming the IFTTT API. So, after a signup, we essentially deferred POSTing for that amount of time, and then batched together signups into a count that we then passed through as _value1_ in the request body to IFTTT.

<figure>
  <img src="/images/blog/the-coda-bell/bell_final.jpg" alt="Schematic for bell" />
  <figcaption>Not winning any design awards with this one, but it works great tucked away in a corner!</figcaption>
</figure>

And there you have it! We had a blast making the Coda Bell, and I hope you enjoyed reading this. Feel free to adopt it yourself, and [tweet at us](https://twitter.com/coda_hq) if you do! Lastly, reach out to me if you have any questions, and P.S., we’re hiring. :)
