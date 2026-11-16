# Sleep science and unmet user needs: what improves sleep, and what apps fail to deliver

Research date: 2026-11-16. Scope: the science and the user-need side only, not competitor feature lists. All findings dated by publication year. Where a figure came only from a search-result summary and the primary paper was not opened, that is flagged.

## 1. Which levers have the strongest evidence (regularity, circadian alignment, light, caffeine/alcohol, CBT-I components, wind-down)?

### Takeaway
The strongest causal evidence is for multicomponent CBT-I (behavioural plus cognitive components), with sleep restriction, stimulus control and cognitive restructuring doing the work and sleep hygiene alone adding little. Large observational cohorts (2023-2024) make sleep regularity and day-bright/night-dark light exposure look as important as, or more important than, duration, but these are associations, not trials. Caffeine has a quantified dose-timing rule (about 9 h before bed for a coffee); wind-down routines have no comparable evidence base that I could find.

### Cited Findings
**CBT-I and its components**
- AASM clinical practice guideline (J Clin Sleep Med, online Nov 2020, print 2021;17(2):255-262): the only strong recommendation is multicomponent CBT-I (moderate-quality evidence, 49 studies). Brief behavioural therapies, stimulus control, sleep restriction and relaxation got conditional recommendations. Sleep hygiene as a standalone therapy is recommended against (sources word this slightly differently) — [NeurologyLive](https://www.neurologylive.com/view/new-aasm-guidelines-make-strong-recommendation-for-behavioral-therapy-in-chronic-insomnia); [AJMC](https://www.ajmc.com/view/new-aasm-guidelines-support-behavioral-psychological-treatments-for-insomnia); [Sleep Review](https://sleepreviewmag.com/sleep-disorders/insomnia/new-guideline-behavioral-psychological-treatments-insomnia/)
- Furukawa et al., JAMA Psychiatry 2024;81(4):357-365, component network meta-analysis of 241 trials and 31,452 adults: cognitive restructuring (remission incremental OR 1.68, 95% CI 1.28-2.20) and third-wave components (iOR 1.49, 95% CI 1.10-2.03) were beneficial. The authors' conclusion also names sleep restriction, stimulus control and in-person delivery as components to keep. Sleep hygiene was in 94% of CBT arms but is not listed among the beneficial components — [BORIS Bern repository](https://boris.unibe.ch/191753); [EurekAlert release](https://www.eurekalert.org/news-releases/1030979)
- Furukawa 2024 limitation: components were coded only as present/absent, although content and implementation varied between programmes — [BORIS Bern repository](https://boris.unibe.ch/191753)

**Sleep regularity**
- Windred et al., SLEEP 2024 (vol. 47, issue 1): Sleep Regularity Index from >10 million hours of accelerometry in 60,977 UK Biobank participants. Top four SRI quintiles vs. least regular quintile: 20-48% lower all-cause mortality, 16-39% lower cancer mortality, 22-57% lower cardiometabolic mortality. Regularity was a stronger predictor of all-cause mortality than duration in nested models — [Flinders research record](https://researchnow.flinders.edu.au/en/publications/sleep-regularity-is-a-stronger-predictor-of-mortality-risk-than-s/); [commentary "Consistency is key", PMC](https://www.ncbi.nlm.nih.gov/pmc/articles/PMC10782489/)
- Caveats: UK Biobank lacks diversity; the authors' 2022 abstract noted regularity may be causal or a marker of poor health — [commentary, PMC](https://www.ncbi.nlm.nih.gov/pmc/articles/PMC10782489/)

**Light exposure**
- Burns, Windred, Rutter et al., Nature Mental Health 2023: objective light-sensor data from 86,772 UK Biobank participants (one week). More daytime light was associated with lower, and more night-time light with higher, risk of depression, generalised anxiety, PTSD, psychosis, bipolar disorder and self-harm. Authors suggest seeking day light and avoiding night light as a simple non-drug measure. Observational — [Nature Mental Health PDF](https://www.nature.com/articles/s44220-023-00135-8.pdf)

**Caffeine and alcohol**
- Gardiner et al., Sleep Medicine Reviews 2023 (24 studies): caffeine reduced total sleep time by about 45.3 min vs. control. To avoid TST loss, a coffee (107 mg/250 mL) should be taken at least 8.8 h before bed; a pre-workout dose (217.5 mg) at least 13.2 h; no cut-off found for a cup of black tea — [Leeds Beckett repository PDF](https://eprints.leedsbeckett.ac.uk/id/eprint/9625/1/TheEffectOfCaffeineOnSubsequentSleepASystematicReviewAndMetaanalysisPV-WEAKLEY.pdf); [AJMC summary](https://www.ajmc.com/view/caffeine-and-sleep-review-suggests-consumption-guidelines)
- Same research group (ACU PhD thesis, 2024): alcohol reduced REM sleep even at low doses (≤0.50 g/kg). No alcohol timing cut-off found — [ACU Research Bank](https://acuresearchbank.acu.edu.au/item/9106w/investigating-the-effects-of-psychoactive-substances-on-subsequent-sleep)

### Inferences
- Ranking for product weight: (1) CBT-I behavioural core (fixed wake time, sleep window/restriction, get out of bed when awake, cognitive work on worry), (2) regularity, especially wake time, (3) morning/daytime light and dim evenings, (4) caffeine timing, (5) alcohol. Sleep-hygiene tips and generic wind-down content are the weakest levers, yet they dominate consumer apps.
- Regularity is directly computable from imported wearable nights (SRI needs only sleep/wake timing, which wearables measure far better than stages). This fits a wearable-import app well.
- A caffeine "cut-off clock" is one of the few consumer rules with a numeric evidence base.

### Gaps
- No effect size found for wind-down routines or bedtime relaxation as standalone consumer interventions (relaxation has only a conditional AASM recommendation).
- No trial found that manipulates regularity alone and measures hard outcomes; regularity evidence is observational.
- Chronotype-matched scheduling: no 2020-2026 intervention trial retrieved for adults (only adolescent school-start data, see section 7).
- Alcohol timing cut-offs not found.

## 2. Digital CBT-I: evidence for Sleepio/SleepioRx, Somryst, Stellar Sleep, Sleep Reset; adherence and dropout

### Takeaway
Fully automated dCBT-I works in RCTs, and benefit scales with adherence. Dropout is high (over 40% in internet CBT-I). Sleepio and Somryst have RCT and FDA backing; Sleep Reset has only a retrospective company-data study; Stellar Sleep has no peer-reviewed evidence I could find. The prescription route has been commercially fragile (Pear bankruptcy 2023).

### Cited Findings
- npj Digital Medicine, March 2025: review of 29 RCTs (9,475 participants) of fully automated dCBT-I. Control-group type moderated outcomes; completion rate did not. Authors conclude adherence (actually doing the behaviours), not merely completing modules, drives effect — [DOAJ record](https://doaj.org/article/dbfe6bf435d7445faee348235881cbea)
- npj Digital Medicine, March 2023: 22 RCTs (10,486 participants) of dCBT-I for depression and anxiety. High-adherence groups showed larger effects on depression, anxiety and sleep outcomes — [DOAJ record](https://doaj.org/article/3799fbd4355743ee86834558021ab652)
- Int J Clin Health Psychology 2025: dropout affects over 40% of internet-delivered CBT-I patients; cites a meta-regression where completion/adherence raises effect size by about 0.2 — [Elsevier](https://www.elsevier.es/en-revista-international-journal-clinical-health-psychology-355-articulo-exploring-dropout-in-internet-delivered-cognitive-S1697260025000560)
- Sleepio (Espie et al., JAMA Psychiatry 2019): 1,711 participants, dCBT vs. sleep hygiene education. Small but significant improvements in functional health (PROMIS adjusted diff 1.76 at 8 and 24 weeks), wellbeing (WEMWBS 2.68 at 8 wk, 2.95 at 24 wk) and sleep-related quality of life (GSII -17.60 at 8 wk, -18.72 at 24 wk). Insomnia improvement mediated 45.5-84.0% of effects. Only 58% completed ≥4 weeks; dropout described as substantial. Funded by Big Health; lead author is a shareholder — [EurekAlert](https://www.eurekalert.org/news-releases/570746); [MDedge](https://mdedge.com/content/digital-cbt-improves-health-well-being-quality-life-randomized-trial)
- SleepioRx: FDA cleared 8 Aug 2024 for chronic insomnia, adults 18+, prescription-only, 90-day programme; new CMS codes allow Medicare reimbursement for qualifying digital mental health treatments — [AASM](https://aasm.org/fda-clears-sleepiorx-for-chronic-insomnia/); [TechTarget](https://techtarget.com/pharmalifesciences/news/366607848/FDA-clears-SleepioRx-digital-therapeutic-for-insomnia-treatment)
- Somryst network meta-analysis (Curr Med Res Opin, 2022, 20 studies): the prescription digital therapeutic reduced insomnia severity more than the sleep medications studied and more than face-to-face CBT-I on ISI. Funding/authorship not checked; treat with caution — [Informa](https://informahealthcare.com/doi/abs/10.1080/03007995.2022.2108616)
- Somryst real-world pragmatic study, 9-week intervention (Frontiers in Psychiatry 2024) — [Frontiers PDF](https://www.frontiersin.org/journals/psychiatry/articles/10.3389/fpsyt.2024.1450615/pdf)
- Pear Therapeutics filed Chapter 11 in April 2023; assets sold for about $6.05M vs. $32M debt and a $1.6B SPAC valuation in 2021. Nox Health bought Somryst for $3.9M — [Fierce Biotech](https://www.fiercebiotech.com/medtech/pear-pulped-digital-therapeutics-makers-assets-sold-6m-auction-after-bankruptcy-filing); [Sleep Review](https://sleepreviewmag.com/sleep-disorders/insomnia/nox-health-closes-acquisition-somryst/)
- Sleep Reset (Frontiers in Sleep, 2023): retrospective analysis of 564 paying completers of a 12-week app + live text coaching programme. Self-reported sleep latency -11 min, WASO -28 min, sleep efficiency +6.6%, TST up (headline: >1 h for short sleepers). Not an RCT; people with insomnia or other sleep disorders were referred out — [Sleep Review](https://sleepreviewmag.com/sleep-diagnostics/screeners/smart-phone/digital-sleep-program-increases-sleep-over-one-hour-short-sleepers/); [NeurologyLive](https://neurologylive.com/view/cognitive-sleep-coaching-program-improves-sleep-duration-quality)
- Stellar Sleep: claims (e.g. "over 80% of users see a dramatic improvement in less than 4 weeks") come from the App Store listing; no peer-reviewed trial found — [App Store](https://apps.apple.com/us/app/id1602312365)
- Access gap: demand for CBT-I providers "drastically exceeds supply" and few behavioural health practitioners have CBT-I training (J Gen Intern Med narrative review, 2018) — [PubMed](https://pubmed.ncbi.nlm.nih.gov/29619651/). A 2025 SBSM registry abstract found only 3.3% (n=8) of CBT-I providers accepting new patients took insurance — [Henry Ford abstract](https://scholarlycommons.henryford.com/sleepmedicine_mtgabstracts/91). Chronic insomnia prevalence is at least about 10% of adults — [Frontiers in Sleep 2023 PDF](https://www.frontiersin.org/journals/sleep/articles/10.3389/frsle.2023.1279903/pdf)

### Inferences
- The efficacy problem is solved; the engagement problem is not. dCBT-I's bottleneck is people doing the hard parts (sleep restriction makes you sleepier for 1-3 weeks before it helps), and modules completed is a poor proxy for that.
- Why people drop out (inferred from adherence findings plus the nature of the components): sleep restriction is aversive early, programmes are solitary and didactic, and diary logging is a chore. A social layer (an accountability partner, shared wake-time streaks) and automatic diary pre-fill from wearable data directly target those friction points. This is inference, not tested.
- Sleep Reset's human-coach model suggests users will pay for accountability, but evidence quality is low.
- The Pear collapse suggests the prescription/reimbursement path is risky for a small team; a consumer, non-medical "CBT-I-informed" habit app avoids FDA burden but cannot make treatment claims.

### Gaps
- No product-level pooled adherence or dropout figures for Sleepio or Somryst.
- SHUTi/Somryst pivotal trial effect sizes not retrieved.
- No qualitative study retrieved that lists user-stated reasons for dCBT-I dropout; the 2025 dropout paper's predictors were not read in full.

## 3. Accuracy of consumer wearables vs. PSG (2023-2026)

### Takeaway
Trust total sleep time and sleep/wake timing moderately (most devices overestimate TST by about 20-40 min because they miss wake). Stage data has only fair-to-moderate agreement (kappa 0.21-0.53 across six wrist devices in 2025). Nightly resting HR and HRV from the better devices (Oura) agree very well with ECG. Timing-based metrics (regularity, bed/wake time) are the most robust things an import app can build on.

### Cited Findings
- Schyvens et al., Sleep Advances 2025 (62 adults, PSG reference; Fitbit Charge 5, Fitbit Sense, Withings Scanwatch, Garmin Vivosmart 4, Whoop 4.0, Apple Watch Series 8): four-stage kappa ranged 0.21-0.53 (Apple Watch 0.53, Fitbit Sense 0.42, Fitbit Charge 5 0.41, Whoop 0.37, Withings 0.22, Garmin 0.21). Sleep sensitivity >90% for all, but wake specificity only 29.39-52.15%. Five of six overestimated TST (Withings ~39 min, Garmin ~38, Whoop ~24, Apple ~19) — [PMC](https://www.ncbi.nlm.nih.gov/pmc/articles/PMC12038347/)
- Sensors 2024 (35 healthy adults aged 20-50, one inpatient PSG night; Oura Gen3, Fitbit Sense 2, Apple Watch Series 8): all similar to PSG for sleep duration; moderate-to-substantial stage agreement. Oura not significantly different from PSG for wake, light, deep or REM; Fitbit overestimated light and underestimated deep; Apple underestimated wake and deep and overestimated light. Small, healthy sample; Oura publicises the study — [PubMed](https://pubmed.ncbi.nlm.nih.gov/39460013/)
- Dial et al., Physiological Reports, Aug 2025 (13 healthy adults, 536 nights, ECG reference): nightly RHR concordance Oura Gen3 CCC 0.97, Gen4 0.98. HRV: Oura Gen4 CCC 0.99 (MAPE 5.96%), Gen3 0.97 (MAPE 7.15%), Whoop next, Garmin Fenix 6 CCC 0.87 (MAPE 10.52%), Polar CCC 0.82 (MAPE 16.32%). Apple Watch not tested. Garmin excluded from RHR analysis for methodological reasons — [PMC](https://www.ncbi.nlm.nih.gov/pmc/articles/PMC12367097/)

### Inferences
- Product rule: show stages as soft, low-precision context, never as the headline or a competitive metric. Lead with timing (bedtime, wake time, regularity), duration (with a known upward bias) and overnight RHR/HRV trends.
- Cross-device comparisons between friends are unfair: Garmin and Withings both read about 40 min of extra sleep vs. Apple's about 20, and stage algorithms differ. A social leaderboard on raw TST or deep sleep across brands would reward hardware, not behaviour. Comparing each person to their own baseline, or on wake-time consistency, sidesteps this.
- Low wake specificity means wearables systematically understate night waking, which is precisely the complaint of people with insomnia. Their "you slept fine" data can feel invalidating (links to section 4).

### Gaps
- No 2023-2026 PSG validation for Samsung Galaxy Watch found.
- Whoop and Garmin data come from older models (Whoop 4.0, Vivosmart 4); newer Garmin firmware claims (vendor blogs) are unverified.
- Validation in people with insomnia, older adults or shift workers is thin; most studies use healthy young adults.
- A widely repeated figure (Apple Watch overestimates light by 45 min and underestimates deep by 43 min) could not be verified against the primary paper.

## 4. Orthosomnia and score anxiety

### Takeaway
Evidence is limited but consistent: an estimated 3-14% of tracker users meet orthosomnia criteria (2024), and an RCT showed that telling insomnia patients they slept badly makes them feel worse the next day regardless of how they actually slept (2018). Feedback framing measurably changes daytime symptoms.

### Cited Findings
- Cross-sectional study, 523 adults (Brain Sciences, 2024): orthosomnia prevalence 3.0%, 8.6% and 14.0% under conservative, moderate and liberal definitions; those with orthosomnia had higher insomnia scores — [PMC](https://pmc.ncbi.nlm.nih.gov/articles/PMC11592250/)
- Term coined in a 2017 J Clin Sleep Med case series: tracking reinforced sleep-related anxiety and perfectionism; Sleep Foundation notes more research is needed — [Sleep Foundation](https://www.sleepfoundation.org/sleep-health/orthosomnia)
- Gavriloff et al., J Sleep Res 2018: 63 people with DSM-5 insomnia randomised to sham "good" vs. "poor" sleep-efficiency feedback from an actigraphy watch. Poor-feedback group reported a larger drop in alertness (d = 0.79) and larger rise in sleepiness/fatigue (d = 0.55). Objective attention and vigilance did not differ. Authors flag implications for inaccurate consumer wearables — [PubMed](https://pubmed.ncbi.nlm.nih.gov/29989248/)

### Inferences
- Design patterns supported by this evidence: (a) do not lead the morning with a judgemental score, especially for users who report insomnia; (b) frame around behaviours the user controls (woke at target time, kept caffeine cut-off) rather than outcomes they cannot force (deep sleep minutes); (c) show weekly trends instead of nightly grades; (d) add explicit uncertainty ("wearables miss about half of wake time"); (e) offer a "hide score" or "no-numbers" mode.
- A social app carries extra risk: public comparison of sleep scores could amplify perfectionism. Celebrating consistency and effort rather than ranking scores is the safer social mechanic.

### Gaps
- No RCT found testing app design patterns that reduce orthosomnia.
- A SLEEP 2026 supplement abstract on the topic exists but was not read — [SLEEP Supplement](https://academic.oup.com/sleep/article/49/Supplement_1/A246/8674102)
- Unverified secondary claims (a Norwegian survey saying 18% feel more anxious; Oxford score-manipulation studies) were excluded.

## 5. Underserved populations and needs

### Takeaway
Insomnia sufferers are the biggest, best-evidenced underserved group: about 10%+ of adults, an effective treatment, and almost no access. Shift workers and peri/menopausal women have dCBT-I adaptations only at pilot or trial-registration stage. New parents have weak evidence for any intervention that improves the parent's own sleep. Couples with mismatched schedules and people without wearables had no research found.

### Cited Findings
- Insomnia: prevalence at least about 10% (some Americas estimates 16.8%) and severe CBT-I access shortage (see section 2) — [Frontiers in Sleep PDF](https://www.frontiersin.org/journals/sleep/articles/10.3389/frsle.2023.1279903/pdf); [PubMed, JGIM 2018](https://pubmed.ncbi.nlm.nih.gov/29619651/). Australian researchers reported only about 1% of Australians with insomnia access CBT-I (press coverage of one study) — [Sleep Review](https://sleepreviewmag.com/sleep-treatments/behavioral-sleep-medicine/cognitive-behavioral-therapy/australia-urged-break-sleeping-pill-dependence-favor-cbt-i/)
- Shift workers: 2024 pilot RCT of a guided dCBT-I adapted for shift work (SleepCare) in nurses with shift work disorder; authors call for larger trials with active controls — [PMC](https://pmc.ncbi.nlm.nih.gov/articles/PMC11596998); a 2025 scoping review on dCBT-I in shift workers exists — [PMC](https://www.ncbi.nlm.nih.gov/pmc/articles/PMC12206534/); a 2019 study found online CBT-I feasible for shift workers but small — [PMC](https://www.ncbi.nlm.nih.gov/pmc/articles/PMC6747089/)
- Menopause: registered trials only — dCBT-I vs. digital sleep hygiene in perimenopausal women to prevent depression over 2 years — [ClinicalTrials.gov NCT07443644](https://clinicaltrials.gov/study/NCT07443644); CELESTE comparing trazodone, daridorexant and CBT-I in peri/post-menopausal women — [NCT07136415 listing](https://www.clinicaltrialsfinder.org/trials/nct07136415-comparing-digital-therapy-trazodone-and-daridorexant-for-men). No results published.
- New parents: meta-analysis of postnatal psychosocial sleep interventions (Kempler et al., 2016) found a small gain in infant night sleep (g = 0.204) but no reduction in night wakings — [ResearchGate PDF](https://researchgate.net/profile/Christopher-Miller-55/publication/283176678_Do_psychosocial_sleep_interventions_improve_infant_sleep_or_maternal_mood_in_the_postnatal_period_A_systematic_review_and_meta-analysis_of_randomised_controlled_trials/links/5a0d6f850f7e9b9e33aa0997/Do-psychosocial-sleep-interventions-improve-infant-sleep-or-maternal-mood-in-the-postnatal-period-A-systematic-review-and-meta-analysis-of-randomised-controlled-trials.pdf). A 2024 RCT secondary analysis (212 Black mothers) found a responsive-parenting intervention did not change mothers' self-reported or actigraphy sleep — [Health Psychology 2024 abstract](https://ifp.nyu.edu/2024/journal-article-abstracts/hea0001363/)
- Teens and students: see section 7 (school start times, social jetlag).

### Inferences
- Couples and households are a natural fit for a social sleep app and appear unstudied in this search: shared bedtime negotiation, partner disruption, and divergent chronotypes. Treat as an opportunity that needs user research, not an evidence-backed feature.
- For shift workers, standard regularity scores and "consistent wake time" advice actively mislead. They need rota-aware anchors (anchor sleep, light timing), which almost no consumer app models.
- New parents: the realistic product need is protecting the parent's sleep opportunity (shift-splitting between partners, nap windows), not optimisation. Evidence for any intervention is weak, so position as support, not treatment.
- People without a wearable: the CBT-I core runs on a sleep diary (bed time, wake time, estimated time awake), which needs no sensor. Phone-only diary logging remains a valid, evidence-aligned path.

### Gaps
- No research found on couples with mismatched schedules or bed-partner sleep in app design.
- No research found on non-wearable users' needs or preferences.
- No published results for menopause-specific dCBT-I.

## 6. The tracking-to-action gap: why users stop, and what would make data actionable

### Takeaway
General-wearable abandonment studies (2015-2019) blame low perceived usefulness, boredom and lost motivation, and say many abandonments are not permanent. Sleep-specific abandonment data was not found. Methods researchers argue that correlational "insights" from tracker data cannot support causal advice, and they propose structured within-person (n-of-1) experiments, but no evidence was found that consumer users act on such insights.

### Cited Findings
- Survey + user-post analysis (2019): top abandonment reasons were lack of perceived usefulness, boredom, and device breakage/malfunction — [arXiv 1904.13226](https://arxiv.org/pdf/1904.13226)
- Chemnitz study, Computers in Human Behavior 2019 (159 former tracker owners): main reasons were demotivation and interruptions/deprioritisation; permanent abandonment was linked to lost tracking motivation; perceived inaccuracy/uselessness was linked to negative attitudes to self-quantification; most abandonment was not permanent — [The 5K Runner summary](https://the5krunner.com/2022/10/13/sport-tracker-watches-reasons-abandonment/)
- Earlier experiments cited in that literature: 50% of students stopped wearing a tracker within three weeks; 34% abandoned within nine weeks in a second experiment — [arXiv 1904.13226](https://arxiv.org/pdf/1904.13226); see also [arXiv 1904.07986](https://arxiv.org/pdf/1904.07986)
- N-of-1 methods literature: analyses of intensive longitudinal tracker data "merely characterize statistical associations", making causal conclusions hard to defend; within-person randomised designs proposed instead; a student self-experimentation study found poor design and analysis were common pitfalls. Sleep-specific example: SleepCoacher, an app that gives recommendations and tests them through guided self-experiments (per search summary; individual paper attribution not verified) — [arXiv 2208.00739](https://arxiv.org/pdf/2208.00739v4); [PMC7151045](https://pmc.ncbi.nlm.nih.gov/articles/PMC7151045)

### Inferences
- The gap is "so what?": dashboards report outcomes (stages, scores) the user cannot directly change, and correlations ("you sleep better on days you walk") are confounded. A habit experiment format — pick one lever with evidence (caffeine cut-off, fixed wake time, morning light), run it for 1-2 weeks with an ABAB or before/after structure, compare against your own baseline on robust metrics (wake time, TST, RHR) — turns data into action. This is inference from sections 1, 3 and 6.
- Social framing may address the motivation decay that drives abandonment (friends doing the same 2-week experiment, shared wake-time streaks), but no sleep-specific evidence was found.
- Since abandonment is often not permanent, re-engagement hooks (seasonal challenges, "your friend started an experiment") may matter more than day-1 onboarding.

### Gaps
- No sleep-tracker-specific abandonment or retention study found.
- No evidence found on whether users change behaviour after receiving personalised sleep insights.
- Commonly quoted figures ("one in ten US adults own a tracker, half no longer use it"; "~30% stop within 6 months") are secondary citations of Endeavour Partners/Gartner; primary sources not found.

## 7. Social jetlag: weekday vs. weekend schedules; is consistent wake time more important than duration?

### Takeaway
Weekend catch-up sleep does not undo weekday restriction in a lab trial, and regularity predicts mortality better than duration in UK Biobank (section 1). The evidence is strong for "regularity matters" and suggestive, not conclusive, for "wake time matters more than duration". Prospective links between social jetlag and metabolic harm are weaker than cross-sectional ones. In adolescents, later school start times consistently lengthen school-night sleep and reduce social jetlag.

### Cited Findings
- Kenneth Wright's lab study (Current Biology, 2019, per news coverage): weekend recovery sleep gave mild improvement over the weekend, but benefits disappeared on return to restricted weekdays; both restricted groups gained weight, snacked more at night and showed reduced metabolic health — [NBC News](https://www.nbcnews.com/health/mental-health/catch-sleep-weekend-may-increase-waistline-study-finds-n977916)
- Nature Reviews Endocrinology 2023 commentary on Bouman et al.: enforced social jetlag disrupts health, but voluntary weekend sleep extension might protect it; cross-sectional associations with metabolic dysfunction were significant while prospective links at 1 and 2 years were not — [Nature Reviews Endocrinology PDF](https://www.nature.com/articles/s41574-023-00851-2.pdf)
- Windred et al., SLEEP 2024: regularity a stronger predictor of all-cause mortality than duration (see section 1) — [Flinders research record](https://researchnow.flinders.edu.au/en/publications/sleep-regularity-is-a-stronger-predictor-of-mortality-risk-than-s/)
- Adolescents, meta-analysis 2023 (37 studies, per search summary): later school start times associated with later sleep timing, longer school-night sleep, less social jetlag; the gap between compared start times and solar-clock timing moderated effects — [PubMed 36864696](https://pubmed.ncbi.nlm.nih.gov/36864696/) (attribution of this record to the 2023 meta-analysis is from the search summary and not verified)
- German flexible-start study (Biller, LMU dissertation): students slept about one hour longer on late-start days, sustained after a year, but total weekly sleep did not rise because the late option was used only partly — [LMU dissertation PDF](https://edoc.ub.uni-muenchen.de/27924/7/Biller_Anna_Magdalena.pdf)

### Inferences
- "Consistent wake time" is the most defensible single behavioural target for a general audience: it is the anchor of CBT-I sleep scheduling, it drives regularity, and it is measured well by wearables. Duration remains important, but people can control wake time directly and cannot force more sleep.
- A weekday-vs-weekend wake-time gap metric (a personal social-jetlag number) is cheap to compute from imported nights and is rarely surfaced as the headline in apps. The 2023 commentary suggests advice should not shame voluntary weekend lie-ins for people who are chronically short of sleep. Framing should be "shrink the gap gradually", not "never sleep in".
- Teens/students are structurally constrained (school start); the actionable levers are light timing and narrowing the weekend shift, not earlier bedtimes by willpower.

### Gaps
- No RCT found comparing "fixed wake time" vs. "more total sleep" head-to-head on health outcomes.
- The Wright study was read via news coverage, not the primary paper.
- No 2023-2026 adult chronotype-alignment intervention trial retrieved.
