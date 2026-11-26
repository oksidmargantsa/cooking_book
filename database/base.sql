--
-- PostgreSQL database dump
--

\restrict wFd7XQumS4DodCEpNbu5FOX9Nep4ot6A4wgvdALiS2VNBndWA54GlmYUhgwCSzO

-- Dumped from database version 16.16 (Debian 16.16-1.pgdg13+1)
-- Dumped by pg_dump version 16.16 (Debian 16.16-1.pgdg13+1)

SET statement_timeout = 0;
SET lock_timeout = 0;
SET idle_in_transaction_session_timeout = 0;
SET client_encoding = 'UTF8';
SET standard_conforming_strings = on;
SELECT pg_catalog.set_config('search_path', '', false);
SET check_function_bodies = false;
SET xmloption = content;
SET client_min_messages = warning;
SET row_security = off;

SET default_tablespace = '';

SET default_table_access_method = heap;

--
-- Name: alembic_version; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.alembic_version (
    version_num character varying(32) NOT NULL
);


--
-- Name: folder_recipes; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.folder_recipes (
    folder_id integer NOT NULL,
    recipe_id integer NOT NULL,
    added_at timestamp with time zone DEFAULT now() NOT NULL
);


--
-- Name: folders; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.folders (
    id integer NOT NULL,
    user_id integer NOT NULL,
    name character varying(150) NOT NULL,
    is_default boolean DEFAULT false NOT NULL,
    created_at timestamp with time zone DEFAULT now() NOT NULL,
    CONSTRAINT ck_folders_name_len CHECK (((char_length((name)::text) >= 1) AND (char_length((name)::text) <= 150)))
);


--
-- Name: folders_id_seq; Type: SEQUENCE; Schema: public; Owner: -
--

CREATE SEQUENCE public.folders_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- Name: folders_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: -
--

ALTER SEQUENCE public.folders_id_seq OWNED BY public.folders.id;


--
-- Name: ingredients; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.ingredients (
    id integer NOT NULL,
    name character varying(160) NOT NULL,
    wikidata_id character varying(20),
    CONSTRAINT ck_ingredients_name CHECK ((((name)::text = btrim((name)::text)) AND ((name)::text <> ''::text)))
);


--
-- Name: ingredients_id_seq; Type: SEQUENCE; Schema: public; Owner: -
--

CREATE SEQUENCE public.ingredients_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- Name: ingredients_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: -
--

ALTER SEQUENCE public.ingredients_id_seq OWNED BY public.ingredients.id;


--
-- Name: recipes; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.recipes (
    id integer NOT NULL,
    author_id integer NOT NULL,
    title character varying(150) NOT NULL,
    photo_key character varying,
    servings integer NOT NULL,
    cook_time_range_id integer NOT NULL,
    cuisine_id integer,
    created_at timestamp with time zone DEFAULT now() NOT NULL,
    updated_at timestamp with time zone DEFAULT now() NOT NULL
);


--
-- Name: recipes_id_seq; Type: SEQUENCE; Schema: public; Owner: -
--

CREATE SEQUENCE public.recipes_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- Name: recipes_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: -
--

ALTER SEQUENCE public.recipes_id_seq OWNED BY public.recipes.id;


--
-- Name: refresh_tokens; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.refresh_tokens (
    id integer NOT NULL,
    user_id integer NOT NULL,
    token_hash character varying(64) NOT NULL,
    expires_at timestamp with time zone NOT NULL,
    revoked_at timestamp with time zone,
    created_at timestamp with time zone DEFAULT now() NOT NULL
);


--
-- Name: refresh_tokens_id_seq; Type: SEQUENCE; Schema: public; Owner: -
--

CREATE SEQUENCE public.refresh_tokens_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- Name: refresh_tokens_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: -
--

ALTER SEQUENCE public.refresh_tokens_id_seq OWNED BY public.refresh_tokens.id;


--
-- Name: users; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.users (
    id integer NOT NULL,
    login character varying(32) NOT NULL,
    password_hash text NOT NULL,
    created_at timestamp with time zone DEFAULT now() NOT NULL,
    CONSTRAINT ck_users_login_len CHECK (((char_length((login)::text) >= 3) AND (char_length((login)::text) <= 32))),
    CONSTRAINT ck_users_login_lower CHECK (((login)::text = lower((login)::text)))
);


--
-- Name: users_id_seq; Type: SEQUENCE; Schema: public; Owner: -
--

CREATE SEQUENCE public.users_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- Name: users_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: -
--

ALTER SEQUENCE public.users_id_seq OWNED BY public.users.id;


--
-- Name: folders id; Type: DEFAULT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.folders ALTER COLUMN id SET DEFAULT nextval('public.folders_id_seq'::regclass);


--
-- Name: ingredients id; Type: DEFAULT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.ingredients ALTER COLUMN id SET DEFAULT nextval('public.ingredients_id_seq'::regclass);


--
-- Name: recipes id; Type: DEFAULT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.recipes ALTER COLUMN id SET DEFAULT nextval('public.recipes_id_seq'::regclass);


--
-- Name: refresh_tokens id; Type: DEFAULT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.refresh_tokens ALTER COLUMN id SET DEFAULT nextval('public.refresh_tokens_id_seq'::regclass);


--
-- Name: users id; Type: DEFAULT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.users ALTER COLUMN id SET DEFAULT nextval('public.users_id_seq'::regclass);


--
-- Data for Name: alembic_version; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public.alembic_version (version_num) FROM stdin;
0003_ingredients
\.


--
-- Data for Name: folder_recipes; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public.folder_recipes (folder_id, recipe_id, added_at) FROM stdin;
\.


--
-- Data for Name: folders; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public.folders (id, user_id, name, is_default, created_at) FROM stdin;
\.


--
-- Data for Name: ingredients; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public.ingredients (id, name, wikidata_id) FROM stdin;
1	cалака	Q3127419
2	oбножка	Q58681899
3	абрикос	Q3733836
4	авокадо	Q961769
5	Агар-агар	Q177998
6	аджика	Q378283
7	айва	Q2751465
8	айвовый мармелад	Q555084
9	аквафаба	Q19820584
10	акулий плавник	Q46711094
11	акулы	Q7372
12	амэ	Q17238884
13	ананас	Q10817602
14	анис звёздчатый	Q1760637
15	Анко	Q1140464
16	апельсин	Q13191
17	апельсиновая кожура	Q102035949
18	арахис	Q3621199
19	арахисовая паста	Q147651
20	арахисовое масло	Q265878
21	арахисовый соус	Q2480049
22	арбуз	Q38645
23	ароматизатор	Q15812117
24	ароматизаторы	Q4173974
25	Арроурут	Q4069888
26	артишок	Q23041430
27	Ачеке	Q2870132
28	базилик	Q65522654
29	базилик душистый	Q38859
30	бакальяу	Q10989778
31	баклажан	Q12533094
32	Баксо	Q843795
33	бамбуковые	Q670887
34	бамбуковые побеги	Q2157176
35	банан	Q503
36	банан для готовки	Q123458126
37	Банановая мука	Q18356389
38	баранина	Q14566073
39	Басмати	Q1649635
40	батат	Q37937
41	бахчевые культуры	Q5881191
42	бедро каплуна	Q110611255
43	безе	Q276276
44	бекон	Q11106
45	белое вино	Q10210
46	белое мясо	Q3315904
47	белокочанная капуста	Q113199286
48	Белый перец	Q744814
49	белый соус	Q10861275
50	белый хлеб	Q1501889
51	белый шоколад	Q742385
52	бешамель	Q209974
53	бизонятина	Q58173066
54	Биск (блюдо)	Q866640
55	бисквит	Q1049852
56	бискит	Q13270
57	биточки	Q1397302
58	бобовая культура	Q145909
59	бобы	Q379813
60	бок-чой	Q165178
61	Болоньезе	Q1162965
62	Братвурст	Q899882
63	брокколи	Q47722
64	брусника	Q12339956
65	брусничный соус	Q1065990
66	бубль-гум	Q1318753
67	буйволиное молоко	Q7224064
68	букет гарни	Q895177
69	булгур	Q250432
70	булочка	Q23004
71	бульон	Q275068
72	Буньюэло	Q8705390
73	Бургундский соус	Q3474133
74	ваниль	Q13241
75	ванильное мороженое	Q12071938
76	ванильный крем	Q2048003
77	ванильный сахар	Q3492989
78	варёная сгущёнка	Q917761
79	варёное зерно	Q107695269
80	варёные яйца	Q1062531
81	вафли	Q1226651
82	венгерские колбасы	Q16147704
83	вермишель	Q20027
84	ветчина	Q170486
85	взбитое яйцо	Q137719046
86	взбитые белки	Q909834
87	взбитые сливки	Q625957
88	винегретная заправка	Q847441
89	вино	Q282
90	Виноградные листья	Q4820063
91	вода	Q283
92	водный продукт	Q107166476
93	Воздушный рис	Q154092
94	вонтоны	Q553905
95	вустерский соус	Q842618
96	выпечка	Q477248
97	высокофруктозный кукурузный сироп	Q11422173
98	ганаш	Q1242466
99	Гарам масала	Q14624
100	гарнир	Q59541
101	гарнир для супа	Q1645720
102	Гауда	Q593675
103	гвоздика	Q15622897
104	гидрокарбонат натрия	Q179731
105	глазурь	Q29437
106	глинтвейн	Q6584
107	говядина	Q192628
108	говяжий язык	Q1558649
109	голова каплуна	Q107246453
110	голова козла	Q1105926
111	голова рыбы	Q5454629
112	головизна	Q4141792
113	голубятина	Q83363036
114	Горгондзола	Q209044
115	горох	Q29472543
116	горчица	Q131748
117	горчичное зерно	Q1937700
118	гранатина	Q13222088
119	Гренни Смит	Q506040
120	грецкий орех	Q208021
121	гречневая каша	Q115678396
122	Грудинка (отруб)	Q1324342
123	груша	Q13099586
124	Гуанчиале	Q194632
125	гусиный смалец	Q2920655
126	гусятина	Q12572741
127	гхи	Q323225
128	Дал	Q1139389
129	Данди (кекс)	Q867610
130	даси	Q851746
131	Демиглас	Q680264
132	дереза	Q2617260
133	Джаггери	Q1148077
134	Джандуйя	Q2270630
135	Джекфрут	Q45757
136	джем	Q1269
137	дрожжевое тесто	Q1593684
138	дрожжевой хлеб	Q21595102
139	Дрожжевой экстракт	Q1593672
140	дрожжи	Q45422
141	Дуриан	Q134185
142	душистый перец	Q1963621
143	жареный лук	Q2202864
144	жаркое	Q899561
145	жевательный мармелад	Q12964402
146	желе	Q20579575
147	желток	Q181409
148	желтопёрый тунец	Q269781
149	жёлтый лук	Q8051898
150	желудок каплуна	Q107246459
151	женьшень	Q20817212
152	животные жиры	Q1423543
153	жидкая вода	Q29053744
154	Жировая сетка	Q662490
155	заварной крем	Q625825
156	закваска	Q2098111
157	заправка	Q12105882
158	зародыш	Q1641345
159	засахаренные фрукты	Q1163138
160	засоленное мясо	Q282910
161	зеленец	Q37964033
162	зелёностручковая фасоль	Q2987371
163	зелёный лук	Q774278
164	зелёный перец	Q103795986
165	зелень петрушки	Q65522500
166	зерно	Q2995529
167	зерновые культуры	Q12117
168	зубчик чеснока	Q28966859
169	изюм	Q13186
170	икра	Q12366140
171	имбирь	Q15046077
172	индюшатина	Q4200953
173	инжир	Q2746643
174	инжирный кекс	Q24460908
175	Искусственная икра	Q4420444
176	йогурт	Q13317
177	кабачок	Q5339237
178	кавурма	Q20064322
179	какао	Q45912917
180	какао-бобы	Q208008
181	какао-порошок	Q1062396
182	калган	Q734727
183	калье	Q622563
184	кальмар	Q550774
185	Камабоко	Q166204
186	капуста	Q14328596
187	капуста белокочанная	Q35051
188	карамель	Q183440
189	кардамон	Q14625808
190	Каррагинан	Q421991
191	карри	Q1144935
192	картофель	Q16587531
193	картофельное пюре	Q322787
194	Картофельные клёцки	Q115166223
195	картофельный крахмал	Q715160
196	картошка фри	Q152088
197	Кафир-лайм	Q465934
198	кацуобуси	Q113739
199	каша	Q186817
200	каштановое пюре	Q67888145
201	каштаны	Q773987
202	квас	Q173773
203	квашеная капуста	Q154166
204	кебаб	Q179010
205	кедровый орех	Q212933
206	Кета	Q475211
207	Кетупат	Q1520778
208	кетчуп	Q178143
209	кефир	Q185749
210	кечап	Q107016646
211	кешью	Q7885904
212	киббех	Q1644022
213	Кинако	Q1463001
214	китайская капуста	Q18968514
215	китайская приправа из 5 трав	Q1051492
216	китятина	Q5653150
217	Кишка	Q25577254
218	клейкий рис	Q115443
219	клубника	Q14458220
220	кляр	Q29493
221	Кнедлик	Q158382
222	коготь каплуна	Q110611256
223	кожа каплуна	Q107304928
224	козий сыр	Q198815
225	козлятина	Q449506
226	кокос	Q3342808
227	кокосовая вода	Q633401
228	кокосовая стружка	Q11117594
229	Кокосовое масло	Q216235
230	кокосовое молоко	Q841779
231	Кокосовый сахар	Q5139861
232	коктейльная вишня	Q1078150
233	колбаса	Q131419
234	колбасная оболочка	Q1372144
235	конджи	Q878624
236	Кондитерская крошка	Q1504300
237	кондитерская мастика	Q1769523
238	Кондитерский жир	Q1194601
239	конина	Q1124327
240	конопляное масло	Q1575477
241	конопляное молоко	Q13099103
242	консервированный анчоус	Q4589261
243	консервированный горошек	Q4145855
244	консервированный тунец	Q5711293
245	конские бобы	Q61672189
246	конфитюр	Q22907436
491	проросток	Q1385709
247	коптильная жидкость	Q909463
248	копчёное мясо	Q1682434
249	Корейка	Q1526944
250	Корень лотоса	Q1059809
251	кориандр	Q20856764
252	коринка	Q1382423
253	корица	Q28165
254	коричневый рис	Q1066624
255	Коричневый сахар	Q11190742
256	корнеплод	Q20136
257	коровье молоко	Q10988133
258	Короккэ	Q1195290
259	костный мозг	Q546523
260	кость каплуна	Q110611260
261	котлета	Q251265
262	котлета для гамбургера	Q3200265
263	кофе	Q8486
264	кочхуджан	Q699637
265	крабовое мясо	Q5180246
266	красная капуста	Q263203
267	красное вино	Q1827
268	Красные водоросли	Q103169
269	красный лук	Q622350
270	красный перец	Q165199
271	крахмал	Q41534
272	крахмальная патока	Q14770547
273	креветки	Q7504001
274	креветочная паста	Q1127705
275	креветочные чипсы	Q16305809
276	крекер	Q856330
277	крем	Q21045264
278	крем-фреш	Q1142459
279	кресс-салат	Q65547658
280	кровяная колбаса	Q154482
281	кроличий хвостик	Q110611103
282	крольчатина	Q3556748
283	крупа	Q1436715
284	крупа из твёрдых сортов пшеницы	Q95370124
285	Крупук	Q715542
286	крутое яйцо	Q13840832
287	крутоны	Q1197400
288	крыло каплуна	Q110611251
289	крюдите	Q2142465
290	Кубики льда	Q488463
291	кукуруза сахарная	Q11575
292	кукурузная крупа	Q10286140
293	кукурузная мука	Q110184114
294	кукурузная тортилья	Q15660894
295	кукурузное ядро	Q3936020
296	кукурузный крахмал	Q3393961
297	кукурузный сироп	Q618739
298	кулинарный алкоголь	Q8193047
299	кунжутное масло	Q212317
300	Кунжутное семя	Q12000036
301	куриная грудка	Q2607161
302	куриное яйцо	Q15260613
303	куриные лапки	Q41384
304	куриный суп	Q1432535
305	курт	Q1113301
306	курятина	Q864693
307	кханом чин	Q13360715
308	кюфта	Q752388
309	лаваш	Q909438
310	лавровый лист	Q2370943
311	лазанья	Q3827309
312	лайм	Q13195
313	лаймовый сок	Q5361217
314	ланспик	Q4254025
315	лапша	Q192874
316	Лардо	Q694642
317	лёгкие каплуна	Q107246456
318	лёд	Q23392
319	леденец	Q17116096
320	лесной орех	Q578307
321	лимон	Q1093742
322	лимонный сок	Q1375049
323	лионская колбаса	Q543025
324	листовые овощи	Q20134
325	листья крапивы	Q96347634
326	лобстер	Q61864890
327	лососёвые	Q2796766
328	лосось	Q83363028
329	лук	Q3406628
330	Лук-батун	Q27938
331	лук-порей	Q1807269
332	луковица лука-шалота	Q67206407
333	луковый порошок	Q7093931
334	лущеный горох	Q2265406
335	Льезон	Q5347861
336	льняное семя	Q911332
337	лягушачьи лапки	Q1258910
338	маис	Q25618328
339	майонез	Q167893
340	мак	Q2007388
341	макадамия	Q11027461
342	макаронные изделия	Q178
343	макароны	Q20019
344	макрель	Q8064278
345	малиновый сок	Q25220811
346	манго	Q169
347	маниок	Q83124
348	манная каша	Q3505415
349	манная крупа	Q381350
350	манхар бланко	Q11690488
351	маргарин	Q4287
352	маринованная сельдь	Q10535659
353	маринованный огурец	Q1365891
354	Марракета	Q982758
355	марципан	Q106252
356	маршмэллоу	Q272198
357	Масло из молока яка	Q200430
358	масло из семян	Q7445643
359	масло какао	Q251106
360	Масло Кассии	Q72515843
361	Масло мяты перечной	Q353391
362	масло чили	Q1026822
363	масляный крем	Q1429013
364	Маття	Q822331
365	маца	Q211361
366	мёд	Q10987
367	медовая вода	Q107262143
368	меласса	Q154389
369	Мидия съедобная	Q27855
370	миндаль	Q184357
371	миндальная мука	Q4733897
372	Миндальное молоко	Q975953
373	мирин	Q1045910
374	мисо	Q235169
375	Можжевельник	Q3251025
376	моллюск	Q6501235
377	молоки	Q1271982
378	молоко	Q8495
379	молотый красный перец	Q5190222
380	молотый перец чили	Q1072946
381	молочная сыворотка	Q185009
382	молочный продукт	Q185217
383	молочный шоколад	Q2164820
384	монофлорный мёд	Q3776580
385	морепродукты	Q192935
386	морковь	Q81
387	мороженое	Q13233
388	морская соль	Q282694
389	моти	Q470519
390	моцарелла	Q14088
391	мука	Q36465
392	мука гречневая	Q11621982
393	мука майда	Q1987316
394	мускатный орех	Q83165
395	муст	Q278818
396	мякишевый хлеб	Q134152
397	мякоть лимона	Q140290322
398	мякоть мацы	Q6534405
399	мясной бульон	Q67860017
400	мясо	Q10990
401	мясо акулы	Q23905700
402	мясо диких животных	Q649978
403	мясо каплуна	Q107246457
404	мясо перепелов	Q7268510
405	мясо птицы	Q124748469
406	мясо северного оленя	Q10650944
407	намуль	Q1062144
408	начинка	Q745361
409	нектар	Q171934
410	нихари	Q7034226
411	нори	Q201565
412	нуга	Q208729
413	нут	Q21156930
414	обезжиренное молоко	Q2352187
415	обезжиренное мясо	Q107262071
416	оболочка тако	Q68492702
417	Обыкновенный букцинум	Q21116
418	обычная пшеничная мука	Q47872684
419	овощи	Q11004
420	овощной бульон	Q42366457
421	овсянка	Q2089240
422	овсяное молоко	Q20972637
423	овсяные хлопья	Q1208221
424	огурец	Q2735883
425	Огурец обыкновенный	Q23425
426	Окара	Q917043
427	Окорок	Q11751063
428	окра	Q12047207
429	оленина	Q2296872
430	оливка	Q1621080
431	оливковое масло	Q93165
432	омлет	Q20129
433	опресноки	Q13365777
434	опунция	Q3367716
435	орегано	Q92581152
436	ореховое молоко	Q20182285
437	Осетровые	Q181871
438	острый соус	Q522171
439	осьминог	Q17118835
440	отруби	Q188672
441	пальмовое масло	Q231458
442	Пальмовый сахар	Q1549017
443	панировочные сухари	Q658413
444	панко	Q1820454
445	Панфорте	Q1278788
446	папайя	Q12330939
447	паприка	Q3127593
448	пармезан	Q155922
449	Пастеризованные яйца	Q7143001
450	пашина	Q1365868
451	Пекарский порошок	Q29476
452	пекинская капуста	Q13360268
453	Пекорино	Q677640
454	Пекорино Романо	Q1246024
455	перга	Q169822
456	перец горошком	Q3143131
457	перец кайенский	Q6598
458	перец сладкий	Q1548030
459	Перкедел	Q20128299
460	персик	Q13202263
461	Персипан	Q1929741
462	песочное тесто	Q1959325
463	песто	Q9896
464	петушиные гребешки	Q116002953
465	печёный картофель	Q1193251
466	печень	Q1470283
467	печень каплуна	Q107246455
468	печенье	Q13266
469	пикуль	Q37963931
470	Писсала	Q3389247
471	пита	Q211340
472	пицца	Q177
473	пищевая добавка	Q189567
474	пищевая паста	Q5726634
475	пищевое масло	Q427457
476	пищевой краситель	Q753009
477	Пищевые дрожжи	Q1786540
478	плантан	Q165449
479	плов	Q485796
480	плод фенхеля	Q27658833
481	плод хлебного дерева	Q5869893
482	поваренная соль	Q11254
483	Подгоревший рис	Q7435296
484	подливка	Q945934
485	подсолнечное масло	Q94787
486	помидор	Q20638126
487	пончик	Q192783
488	пралине	Q3401308
489	приправочный соус	Q15468663
490	приправы	Q2596997
492	пророщенные бобы	Q2459072
493	просо	Q259438
494	простокваша	Q253333
495	Прошутто	Q1065033
496	пудинг	Q9053
497	пчелиный воск	Q143739
498	пшеница	Q15645384
499	пшеничная мука	Q2249305
500	пшеничная тортилья	Q204251
501	пшённая каша	Q159841
502	пятачок	Q107246703
503	рагу	Q565767
504	радиккьо	Q767765
505	разрыхлитель пищевой	Q908833
506	раковое масло	Q1750077
507	раковые шейки	Q96756338
508	рамэн	Q234646
509	Ранси	Q11954575
510	рапсовое масло	Q697248
511	растительное масло	Q4739805
512	растительный жир	Q11870297
513	репа	Q3916957
514	речные раки	Q1211742
515	ржаная мука	Q10658708
516	ржаной хлеб	Q3893120
517	ржаные отруби	Q105549861
518	рикотта	Q216781
519	рис	Q5090
520	Рисовая бумага	Q3094709
521	рисовая вермишель	Q716004
522	рисовая мука	Q1269205
523	рисовый пирог	Q15149436
524	рисовый пудинг	Q19029
525	рогалик	Q877538
526	рожь	Q109301486
527	розмарин	Q68315046
528	розовое масло	Q83054
529	Розовый перец	Q2497744
530	ростки маша	Q7635866
531	Ру	Q746427
532	руй	Q1937652
533	рулька	Q153976
534	Руссиш брот	Q2177023
535	русский соус	Q7382200
536	рыба	Q600396
537	рыбий клей	Q1255331
538	рыбий хвост	Q107246611
539	Рыбная паста	Q8563413
540	рыбное филе	Q15944430
541	рыбные консервы	Q5032629
542	рыбные котлеты	Q594675
543	рыбный соус	Q545985
544	Сабле	Q2915670
545	савоярди	Q12494
546	Саго	Q218778
547	Сакэ касу	Q987117
548	салат	Q9266
549	салат латук	Q83193
550	салатная заправка	Q1572278
551	сало	Q6496411
552	сальморехо	Q1635129
553	сальса криола	Q5204114
554	салями	Q188655
555	самбал	Q1056554
556	Сардина	Q5141254
557	сахар	Q11002
558	сахар-кандис	Q849816
559	Сахарная пальма	Q227984
560	сахарная пудра	Q151070
561	сахарный песок	Q4409456
562	сашими	Q190715
563	Сванская соль	Q477103
564	свежая рыба	Q11674224
565	свежий сыр	Q3323634
566	свёкла	Q99548274
567	свёкла столовая	Q165437
568	свекольная ботва	Q9178190
569	светлая патока	Q2688129
570	свиная отбивная	Q860985
571	свиная печень	Q18384179
572	свиная шкурка	Q3695900
573	свинина	Q191768
574	сгущённое молоко	Q2830455
575	седло	Q107262074
576	сельдерей	Q23012379
577	сельди	Q209907
578	сельдь (пища)	Q17077995
579	семена аниса	Q33873455
580	семена тмина	Q21155816
581	семечки сельдерея	Q102256772
582	Семур	Q7449844
583	Сирене	Q13557581
584	сироп	Q6584340
585	Сквашенное молоко	Q28666270
586	сладкие взбитые сливки	Q6384329
587	сладость	Q3087607
588	слива	Q12372598
589	сливки	Q13228
590	сливочное масло	Q34172
591	сливочный сыр	Q426337
592	слоёное тесто	Q29221
593	смалец	Q72827
594	сметана	Q326061
595	смородина	Q3241599
596	Соба	Q753910
597	собачатина	Q826031
598	соевая мука	Q57656115
599	Соевая паста	Q4426758
600	Соевое молоко	Q192199
601	соевые бобы	Q61503220
602	соевый жмых	Q364900
603	соевый соус	Q229385
604	сок	Q11550473
605	солёное мясо	Q7190898
606	солёные огурцы	Q1211297
607	соленье	Q1503784
608	солод	Q152024
609	Солодка уральская	Q1196166
610	солонина	Q1133209
611	соль и перец	Q7405972
612	сорго	Q105549747
613	сорт швейцарского сыра	Q19359994
614	сосиска	Q327316
615	соус	Q178359
616	соус альфредо	Q23930012
617	соус барбекю	Q807791
618	соцветие банана	Q31830399
619	спагетти	Q20026
620	специи	Q42527
621	Стокфиск	Q213725
622	Столетнее яйцо	Q622547
623	строганый лёд	Q7491078
624	субпродукты	Q157484
625	Сулугуни	Q2303453
626	Сумак	Q16131953
627	сумэси	Q10861403
628	сухари	Q5477096
629	сухие завтраки	Q768267
630	сухое молоко	Q496696
631	сухофрукты	Q234901
632	сушёная рыба	Q5307391
633	сушёное мясо	Q1753272
634	сушёные грибы	Q11702846
635	сушёные орехи и фрукты	Q3320037
636	Сушёный инжир	Q5678503
637	суши	Q46383
638	съедобное насекомое	Q38117921
639	съедобные двустворчатые морские моллюски	Q1192868
640	съедобный гриб	Q654236
641	сыр	Q10943
642	сырая рыба	Q44480852
643	сыровяленая колбаса	Q81529494
644	сырое или непастеризованное молоко	Q513631
645	сырое яйцо	Q116810133
646	Сычуаньский перец	Q756800
647	сычужный фермент	Q326900
648	Табаско	Q335016
649	Такуан	Q701797
650	талкан	Q18409302
651	тальятелле	Q20044
652	Тамаринд	Q80235
653	тапиока	Q873761
654	Таро	Q227997
655	Тарэ	Q4387502
656	Твенджан	Q1196289
657	твёрдый сыр	Q1412674
658	творог	Q116007203
659	телятина	Q957434
660	Темпе	Q120096
661	тёртое какао	Q1721876
662	тесто	Q178024
663	тесто для выпечки	Q116188654
664	тмин	Q57328174
665	томат	Q23501
666	Томат черри	Q6540634
667	томатная паста	Q1499073
668	томатный сок	Q787325
669	томатный соус	Q3596097
670	топлёное масло	Q2789594
671	тортилья	Q55642411
672	тосканская кудрявая капуста	Q2048275
673	тостовый хлеб	Q6128
674	тофу	Q177378
675	требуха	Q470873
676	Треска	Q13194939
677	тростниковый сахар	Q18012503
678	тток	Q703413
679	тунцовый салат	Q2884546
680	турнедо	Q1639520
681	Туррон	Q159304
682	туша	Q12577982
683	тхуа нао	Q13015322
684	тыква	Q165308
685	тысяча островов	Q1199019
686	угорь	Q5347044
687	Удон	Q471861
688	уклейка	Q200473
689	укроп	Q26686
690	уксус	Q41354
691	Умэбоси	Q1045417
692	Унаги	Q1422437
693	усилитель вкуса	Q898745
694	устрица	Q107411
695	устрицы	Q124750133
696	устричный соус	Q780827
697	утятина	Q542042
698	фарш	Q13400960
699	фасолины	Q74662248
700	фасоль стручковая	Q18175531
701	фенхель	Q104005460
702	фенхель обыкновенный	Q43511
703	фета	Q182760
704	фетучини	Q20032
705	филло	Q1866347
706	финик	Q1652093
707	фисташка	Q14959225
708	фо	Q420646
709	Фонтина	Q534043
710	французский багет	Q208172
711	фрикадельки	Q4831844
712	фрукт	Q3314483
713	фруктовый пирог	Q675987
714	фруктовый сироп	Q1190923
715	фунчоза	Q840448
716	халапеньо	Q504133
717	хамон	Q2165047
718	хамон серрано	Q584324
719	хвост выдры	Q107246693
720	Херес	Q16398
721	хлеб	Q7802
722	хлебная закваска	Q904889
723	хлебное зерно	Q73352087
724	хлебный пудинг	Q990900
725	хот-дог	Q181055
726	хурма	Q29526
727	Цветки тыкв	Q42293042
728	цветная капуста	Q23900272
729	цветы Bombax ceiba	Q136468367
730	цедра	Q196819
731	цедра лимона	Q206454
732	Цельнозерновая мука	Q13225835
733	цимбопогон	Q5727732
734	цукаты	Q2297811
735	цукини	Q7533
736	Цукэмоно	Q7480691
737	Чаат масала	Q1068141
738	Чайот	Q319611
739	Чапати	Q752006
740	чатни	Q275650
741	чашао	Q1204605
742	Чеддер	Q217525
743	чена	Q5094870
744	черника	Q137373435
745	чернослив	Q6766526
746	черный перец	Q22915010
747	чёрный чай	Q203415
748	чеснок	Q21546392
749	чесночный корень	Q116964186
750	чесночный порошок	Q10716334
751	чечевица	Q61505177
752	чечил	Q4515355
753	чизкейк	Q215348
754	чипсы	Q173265
755	Чичаррон	Q3667736
756	чорисо	Q23374
757	чурраско	Q1089959
758	шампиньон	Q390456
759	Шампиньон двуспоровый	Q227690
760	шафран	Q25434
761	швейцарский сыр	Q4117114
762	шея каплуна	Q107246458
763	шиитаке	Q320999
764	Шиповник	Q46740
765	шкура дикого кабана	Q110611157
766	шницель	Q11293688
767	шоколад	Q195
768	шпинат	Q36814998
769	шпинат огородный	Q81464
770	экстракт ванили	Q10749869
771	экстракт солодки	Q104189182
772	эмменталь	Q932214
773	эссенция	Q12059629
774	Эцзяо	Q909377
775	Ютяо	Q713879
776	яблоко	Q89
777	ягнятина	Q643419
778	ядрица	Q4536337
779	яичная лаша	Q116506414
780	яичный белок	Q796758
781	яйцо	Q93189
782	яйцо пашот	Q1363043
783	яйцо птицы	Q659503
784	яйцо сваренное всмятку	Q11716216
785	ямс	Q8047551
786	японская лапша	Q17116319
787	Японский рис	Q17173229
788	Японское карри	Q701870
789	Ячменная крупа	Q2743860
790	ячменная мука	Q25323983
791	ячмень	Q61665121
\.


--
-- Data for Name: recipes; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public.recipes (id, author_id, title, photo_key, servings, cook_time_range_id, cuisine_id, created_at, updated_at) FROM stdin;
\.


--
-- Data for Name: refresh_tokens; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public.refresh_tokens (id, user_id, token_hash, expires_at, revoked_at, created_at) FROM stdin;
\.


--
-- Data for Name: users; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public.users (id, login, password_hash, created_at) FROM stdin;
\.


--
-- Name: folders_id_seq; Type: SEQUENCE SET; Schema: public; Owner: -
--

SELECT pg_catalog.setval('public.folders_id_seq', 1, false);


--
-- Name: ingredients_id_seq; Type: SEQUENCE SET; Schema: public; Owner: -
--

SELECT pg_catalog.setval('public.ingredients_id_seq', 791, true);


--
-- Name: recipes_id_seq; Type: SEQUENCE SET; Schema: public; Owner: -
--

SELECT pg_catalog.setval('public.recipes_id_seq', 1, false);


--
-- Name: refresh_tokens_id_seq; Type: SEQUENCE SET; Schema: public; Owner: -
--

SELECT pg_catalog.setval('public.refresh_tokens_id_seq', 1, false);


--
-- Name: users_id_seq; Type: SEQUENCE SET; Schema: public; Owner: -
--

SELECT pg_catalog.setval('public.users_id_seq', 1, false);


--
-- Name: alembic_version alembic_version_pkc; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.alembic_version
    ADD CONSTRAINT alembic_version_pkc PRIMARY KEY (version_num);


--
-- Name: folder_recipes folder_recipes_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.folder_recipes
    ADD CONSTRAINT folder_recipes_pkey PRIMARY KEY (folder_id, recipe_id);


--
-- Name: folders folders_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.folders
    ADD CONSTRAINT folders_pkey PRIMARY KEY (id);


--
-- Name: ingredients ingredients_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.ingredients
    ADD CONSTRAINT ingredients_pkey PRIMARY KEY (id);


--
-- Name: recipes recipes_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.recipes
    ADD CONSTRAINT recipes_pkey PRIMARY KEY (id);


--
-- Name: refresh_tokens refresh_tokens_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.refresh_tokens
    ADD CONSTRAINT refresh_tokens_pkey PRIMARY KEY (id);


--
-- Name: refresh_tokens refresh_tokens_token_hash_key; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.refresh_tokens
    ADD CONSTRAINT refresh_tokens_token_hash_key UNIQUE (token_hash);


--
-- Name: ingredients uq_ingredients_wikidata_id; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.ingredients
    ADD CONSTRAINT uq_ingredients_wikidata_id UNIQUE (wikidata_id);


--
-- Name: users uq_users_login; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.users
    ADD CONSTRAINT uq_users_login UNIQUE (login);


--
-- Name: users users_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.users
    ADD CONSTRAINT users_pkey PRIMARY KEY (id);


--
-- Name: ix_folder_recipes_recipe_id; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX ix_folder_recipes_recipe_id ON public.folder_recipes USING btree (recipe_id);


--
-- Name: ix_folders_user_id; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX ix_folders_user_id ON public.folders USING btree (user_id);


--
-- Name: ix_refresh_tokens_expires_at; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX ix_refresh_tokens_expires_at ON public.refresh_tokens USING btree (expires_at);


--
-- Name: ix_refresh_tokens_user_id; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX ix_refresh_tokens_user_id ON public.refresh_tokens USING btree (user_id);


--
-- Name: uq_folders_one_default_per_user; Type: INDEX; Schema: public; Owner: -
--

CREATE UNIQUE INDEX uq_folders_one_default_per_user ON public.folders USING btree (user_id) WHERE is_default;


--
-- Name: uq_ingredients_normalized_name; Type: INDEX; Schema: public; Owner: -
--

CREATE UNIQUE INDEX uq_ingredients_normalized_name ON public.ingredients USING btree (replace(lower((name)::text), 'ё'::text, 'е'::text));


--
-- Name: folder_recipes folder_recipes_folder_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.folder_recipes
    ADD CONSTRAINT folder_recipes_folder_id_fkey FOREIGN KEY (folder_id) REFERENCES public.folders(id) ON DELETE CASCADE;


--
-- Name: folder_recipes folder_recipes_recipe_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.folder_recipes
    ADD CONSTRAINT folder_recipes_recipe_id_fkey FOREIGN KEY (recipe_id) REFERENCES public.recipes(id) ON DELETE CASCADE;


--
-- Name: folders folders_user_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.folders
    ADD CONSTRAINT folders_user_id_fkey FOREIGN KEY (user_id) REFERENCES public.users(id) ON DELETE CASCADE;


--
-- Name: recipes recipes_author_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.recipes
    ADD CONSTRAINT recipes_author_id_fkey FOREIGN KEY (author_id) REFERENCES public.users(id) ON DELETE CASCADE;


--
-- Name: refresh_tokens refresh_tokens_user_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.refresh_tokens
    ADD CONSTRAINT refresh_tokens_user_id_fkey FOREIGN KEY (user_id) REFERENCES public.users(id) ON DELETE CASCADE;


--
-- PostgreSQL database dump complete
--

\unrestrict wFd7XQumS4DodCEpNbu5FOX9Nep4ot6A4wgvdALiS2VNBndWA54GlmYUhgwCSzO
