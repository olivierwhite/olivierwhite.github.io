---
layout: layouts/page.njk
title: Research
description: "Research of Olivier White: motor control and learning, graviception (gravity in the brain and body) and functional variability, with current projects, methods and collaborators."
---
<section class="lead">

For more than twenty years I have studied motor control and learning at the interface of computational neuroscience, psychology, robotics, engineering and movement sciences. My work asks how the brain anticipates, adapts and optimises action, especially in unusual or extreme environments. It is organised along three axes.

<nav aria-label="On this page" class="on-this-page">
<a href="#axis1">1. Motor control and learning</a>
<a href="#axis2">2. Graviception</a>
<a href="#axis3">3. Functional variability</a>
<a href="#projects">Current projects</a>
<a href="#collaborators">Collaborators</a>
</nav>
</section>

<section id="axis1" class="axis split">
<div class="split-text">

## <span class="num">1.</span> Motor control and learning

Using unimanual and bimanual haptic systems, I study how we adapt grip force and reaching movements when the dynamics of the world change. This work has refined our understanding of internal models: how grip force is controlled during collisions, and how the brain switches between models of a tool's dynamics rather than relearning them.

With J. Diedrichsen, I contributed to explaining use-dependent learning, the bias that repetition alone introduces into movement (*J Neurosci*, 2010), and to how the nervous system assigns corrective responsibility across a redundant body (*Curr Biol*, 2010). I also showed that pupil diameter tracks motor learning and mental effort, trial by trial (*J Mot Behav*, 2016). More recently I examined how auditory and visual feedback jointly shape learning, retention and generalisation (*Eur J Neurosci*, 2026).

<div class="key-papers">

**Key papers:** White & Diedrichsen, *Curr Biol* 2010 · Diedrichsen et al., *J Neurosci* 2010 · White et al., *Front Neurorobot* 2018 · White, *Eur J Neurosci* 2026

</div>
</div>
{% figure "bimanual" %}
</section>

<section id="axis2" class="axis">

## <span class="num">2.</span> Graviception: gravity in the brain and body

Gravity is a central parameter in planning and controlling action, and the thread of my career since my PhD. My results show that the brain takes gravitational changes into account very quickly, and anticipates a new gravito-inertial environment. Gravity is not an obstacle to overcome but information the brain uses.

<div class="figure-pair">
{% figure "parabolic", "(min-width: 760px) 400px, 100vw" %}
{% figure "centrifuge", "(min-width: 760px) 400px, 100vw" %}
</div>

I have run experiments in parabolic flights (seven ESA campaigns, 2002–2005; CNES campaigns in 2019 and 2025), human centrifuges (Sweden 2013, France 2016), bedrest and dry immersion, and contributed to an experiment flown on the International Space Station (2018). In the 2019 CNES campaign, a robot restored Earth-like gravity at the hand in real time during weightlessness, and motor control benefited. With functional MRI, we found distinct roles for the posterior and anterior insula in processing gravity (*Cereb Cortex*, 2020).

With N. Goswami (Graz), I extended this theme to interactions between the motor and cardiovascular systems, including sex differences and the effect of stress. I contributed the sensorimotor sections to a major review of gravity, microgravity and artificial gravity (*Physiol Rev*, 2026).

<div class="key-papers">

**Key papers:** White et al., *J Neurophysiol* 2020 (review) · Gritsenko et al., *PNAS* (in press) · Kunavar et al., *Front Neural Circuits* 2021 · Rousseau et al., *Cereb Cortex* 2020 · Barbusse et al., *J Neurophysiol* 2026 · Goswami et al., *Physiol Rev* 2026

</div>
</section>

<section id="axis3" class="axis">

## <span class="num">3.</span> Functional variability: when noise helps

Classical models treat variability as noise to eliminate. I study the opposite idea: that a healthy nervous system operates with an optimal amount of variability, at a point of intermediate predictability and maximal complexity, which keeps movement flexible. This links to stochastic resonance, where a non-linear system performs best with a non-zero level of noise.

We quantify this with the Hurst exponent (predictability) and the fractal dimension (complexity), applied to gait, rhythmic arm movements and grip force. With physicists at the University of Mons (N. Boulanger, F. Buisseret) and F. Dierick (Rehazenter, Luxembourg), we also develop theory: adiabatic invariants and higher-derivative mechanics as principles of motor control. A centrifuge study showed that stress and gravity jointly disrupt the tuning of rhythmic movements (*iScience*, 2024).

<div class="key-papers">

**Key papers:** White et al., *iScience* 2024 · Buisseret et al., *Chaos Solitons Fractals* 2025 · Boulanger et al., *Phys Rev E* 2020 and 2021 · White et al., *Front Appl Math Stat* 2025 · White et al., *Front Physiol* 2019 (stochastic resonance)

</div>
</section>

<section id="projects" aria-labelledby="projects-title">
<h2 id="projects-title">Current projects</h2>

<span class="item-title">SYNOISE</span> — an international consortium on the functional role of biological variability, from cells to behaviour, with physicists (Mons) and neurobiologists (Turin). Preparation supported by an ANR MRSEI grant (2025).

<figure class="synoise">
<div class="synoise-wide">{% inlineSvg "synoise-variability.svg", "Complexity peaks between rigid order and pure randomness; a structured, 1/f-like trace sits at the peak, and the same signature is shown for neurons, networks, movement and learning", "synoise-wide" %}</div>
<div class="synoise-tall">{% inlineSvg "synoise-variability-mobile.svg", "Complexity peaks between rigid order and pure randomness; a structured, 1/f-like trace sits at the peak, and the same signature is shown for neurons, networks, movement and learning", "synoise-tall" %}</div>
<figcaption>Healthy systems sit between rigid order and pure noise. SYNOISE asks whether this signature of functional variability recurs from cells to behaviour.</figcaption>
</figure>

<span class="item-title">ENVERGURE</span> — Région Bourgogne-Franche-Comté, SmartCav call, 2026–; co-PI. AI-driven biomarkers of drowsiness while driving.

<span class="item-title">Altered-gravity campaigns</span> — 69th CNES parabolic-flight campaign (2025, co-PI, with ESA and the UAE Space Agency) on cardio-postural interactions; VIVALDI III dry immersion and bedrest (co-investigator, 2024).

</section>

<section aria-labelledby="methods">
<h2 id="methods">Methods and platforms</h2>

Haptic robots and force fields · immersive virtual reality · motion capture and accelerometry · grip and load force sensors · EMG, ECG and heart-rate variability · eye tracking and pupillometry · functional MRI · parabolic flight, centrifuge, bedrest · optimal feedback control, Bayesian models, fractal and non-linear time-series analysis.

</section>

<section id="collaborators" aria-labelledby="collaborators-title">
<h2 id="collaborators-title">Collaborators</h2>
<div class="split">
<div class="split-text">{% collaborators %}</div>
{% figure "topicalTeam" %}
</div>
</section>

<section aria-labelledby="funding">
<h2 id="funding">Selected funding</h2>

CNES (parabolic flights, centrifuge, PhD fellowship) · ESA (Delta-G Topical Team; parabolic flight with the UAE Space Agency) · ANR (MRSEI, 2025) · I-SITE Bourgogne-Franche-Comté (two projects, 2019–2022) · Région Bourgogne-Franche-Comté (ENVERGURE; PhD fellowships) · European Regional Development Fund (haptics, fMRI platform) · INSERM Chaire d'Excellence (2010–2017) · French–Slovenian collaboration grant (2024).

</section>
