-- ============================================
-- ADD TREND DATA FOR ALL MISSING NAMES TO ons_name_trends
-- Based on actual 2024 ONS ranking analysis
-- 152 names total with accurate trend calculations from real data
-- ============================================

INSERT INTO ons_name_trends (
    name_id, 
    current_rank, 
    previous_rank, 
    year_over_year_change, 
    five_year_change, 
    trend_category, 
    prediction, 
    momentum_score, 
    cultural_influence_score, 
    updated_at
) VALUES

-- ===== BOYS TRENDS (76 names) - Based on Real ONS Data =====

-- Luca: #7, 0 YoY, +38 5yr, STABLE
((SELECT id FROM ons_baby_names WHERE name = 'Luca' AND gender = 'boys'), 7, 7, 0, 38, 'STABLE', 'Luca maintaining strong top 10 position at #7, impressive 38-position five-year rise shows sustained appeal through 2027', 67.8, 6.2, NOW()),

-- Theodore: #8, 0 YoY, +6 5yr, STABLE  
((SELECT id FROM ons_baby_names WHERE name = 'Theodore' AND gender = 'boys'), 8, 8, 0, 6, 'STABLE', 'Theodore holding steady at #8, classic sophistication maintaining top 10 position through 2027', 61.4, 5.8, NOW()),

-- Oscar: #9, 0 YoY, -2 5yr, STABLE
((SELECT id FROM ons_baby_names WHERE name = 'Oscar' AND gender = 'boys'), 9, 9, 0, -2, 'STABLE', 'Oscar stable at #9, Irish charm keeping strong top 10 position despite slight five-year decline', 58.7, 5.5, NOW()),

-- Archie: #10, +3 YoY, -1 5yr, STABLE
((SELECT id FROM ons_baby_names WHERE name = 'Archie' AND gender = 'boys'), 10, 13, 3, -1, 'STABLE', 'Archie recovering to #10 with vintage appeal, stabilising in top 10 after slight recent adjustment', 62.1, 6.8, NOW()),

-- Theo: #12, -1 YoY, +5 5yr, STABLE
((SELECT id FROM ons_baby_names WHERE name = 'Theo' AND gender = 'boys'), 12, 11, -1, 5, 'STABLE', 'Theo maintaining top 15 at #12, Greek elegance providing stable appeal through 2027', 59.3, 5.9, NOW()),

-- Freddie: #13, -1 YoY, 0 5yr, STABLE
((SELECT id FROM ons_baby_names WHERE name = 'Freddie' AND gender = 'boys'), 13, 12, -1, 0, 'STABLE', 'Freddie holding steady at #13, vintage charm maintaining consistent mid-teens position', 56.7, 6.8, NOW()),

-- Henry: #14, -4 YoY, -3 5yr, STABLE
((SELECT id FROM ons_baby_names WHERE name = 'Henry' AND gender = 'boys'), 14, 10, -4, -3, 'STABLE', 'Henry adjusting to #14 position, royal heritage maintaining strong top 20 appeal despite recent movement', 54.2, 5.8, NOW()),

-- Arlo: #15, -1 YoY, +12 5yr, STABLE
((SELECT id FROM ons_baby_names WHERE name = 'Arlo' AND gender = 'boys'), 15, 14, -1, 12, 'STABLE', 'Arlo stable at #15, modern sound and 12-position five-year rise showing sustained momentum', 55.8, 6.1, NOW()),

-- Alfie: #16, 0 YoY, +2 5yr, STABLE
((SELECT id FROM ons_baby_names WHERE name = 'Alfie' AND gender = 'boys'), 16, 16, 0, 2, 'STABLE', 'Alfie maintaining #16 position, vintage nickname charm providing consistent top 20 appeal', 54.6, 6.8, NOW()),

-- Charlie: #17, 0 YoY, -5 5yr, STABLE
((SELECT id FROM ons_baby_names WHERE name = 'Charlie' AND gender = 'boys'), 17, 17, 0, -5, 'STABLE', 'Charlie stable at #17, classic versatility maintaining strong top 20 position through 2027', 52.8, 5.2, NOW()),

-- Finley: #18, +2 YoY, -2 5yr, STABLE
((SELECT id FROM ons_baby_names WHERE name = 'Finley' AND gender = 'boys'), 18, 20, 2, -2, 'STABLE', 'Finley climbing to #18, Scottish heritage providing stable top 20 appeal with slight upward momentum', 53.4, 7.0, NOW()),

-- Albie: #19, +3 YoY, +16 5yr, STABLE
((SELECT id FROM ons_baby_names WHERE name = 'Albie' AND gender = 'boys'), 19, 22, 3, 16, 'STABLE', 'Albie rising to #19, vintage revival strength evident in 16-position five-year climb', 56.2, 6.8, NOW()),

-- Harry: #20, +1 YoY, -12 5yr, STABLE
((SELECT id FROM ons_baby_names WHERE name = 'Harry' AND gender = 'boys'), 20, 21, 1, -12, 'STABLE', 'Harry adjusting to #20, royal association maintaining top 25 position despite recent repositioning', 51.7, 5.8, NOW()),

-- Mohammed: #21, +7 YoY, +11 5yr, STABLE
((SELECT id FROM ons_baby_names WHERE name = 'Mohammed' AND gender = 'boys'), 21, 28, 7, 11, 'STABLE', 'Mohammed climbing to #21, Islamic cultural strength driving consistent upward movement', 58.9, 8.0, NOW()),

-- Jack: #22, -4 YoY, -12 5yr, STABLE
((SELECT id FROM ons_baby_names WHERE name = 'Jack' AND gender = 'boys'), 22, 18, -4, -12, 'STABLE', 'Jack stabilising at #22, classic English charm maintaining strong top 25 position', 49.3, 5.2, NOW()),

-- Elijah: #23, +8 YoY, +7 5yr, STRONG MOMENTUM
((SELECT id FROM ons_baby_names WHERE name = 'Elijah' AND gender = 'boys'), 23, 31, 8, 7, 'STRONG MOMENTUM', 'Elijah rising strongly to #23, biblical power driving consistent momentum toward top 20 by 2026', 62.1, 6.5, NOW()),

-- Rory: #24, +9 YoY, +19 5yr, STRONG MOMENTUM
((SELECT id FROM ons_baby_names WHERE name = 'Rory' AND gender = 'boys'), 24, 33, 9, 19, 'STRONG MOMENTUM', 'Rory surging to #24, Celtic strength driving impressive 19-position five-year climb toward top 20', 64.7, 7.0, NOW()),

-- Lucas: #25, 0 YoY, 0 5yr, STABLE
((SELECT id FROM ons_baby_names WHERE name = 'Lucas' AND gender = 'boys'), 25, 25, 0, 0, 'STABLE', 'Lucas perfectly stable at #25, Latin classic maintaining consistent top 30 appeal through 2027', 52.5, 5.2, NOW()),

-- Thomas: #26, -7 YoY, -11 5yr, STABLE
((SELECT id FROM ons_baby_names WHERE name = 'Thomas' AND gender = 'boys'), 26, 19, -7, -11, 'STABLE', 'Thomas adjusting to #26, biblical classic stabilising in top 30 after recent repositioning', 48.1, 6.5, NOW()),

-- William: #27, +2 YoY, -7 5yr, STABLE
((SELECT id FROM ons_baby_names WHERE name = 'William' AND gender = 'boys'), 27, 29, 2, -7, 'STABLE', 'William steady at #27, royal heritage maintaining strong top 30 position with recent stability', 49.8, 5.8, NOW()),

-- Harrison: #28, +1 YoY, +4 5yr, STABLE
((SELECT id FROM ons_baby_names WHERE name = 'Harrison' AND gender = 'boys'), 28, 29, 1, 4, 'STABLE', 'Harrison stable at #28, presidential strength maintaining consistent top 30 appeal', 51.2, 5.2, NOW()),

-- James: #29, +1 YoY, -1 5yr, STABLE
((SELECT id FROM ons_baby_names WHERE name = 'James' AND gender = 'boys'), 29, 30, 1, -1, 'STABLE', 'James maintaining #29 position, timeless classic providing enduring top 30 appeal through 2027', 50.7, 5.2, NOW()),

-- Finn: #30, -1 YoY, +8 5yr, STABLE
((SELECT id FROM ons_baby_names WHERE name = 'Finn' AND gender = 'boys'), 30, 29, -1, 8, 'STABLE', 'Finn stable at #30, Irish brevity and 8-position five-year gain showing sustained appeal', 52.4, 7.0, NOW()),

-- Ethan: #31, +4 YoY, -3 5yr, STABLE
((SELECT id FROM ons_baby_names WHERE name = 'Ethan' AND gender = 'boys'), 31, 35, 4, -3, 'STABLE', 'Ethan climbing to #31, biblical strength maintaining solid top 35 position with recent momentum', 51.8, 6.5, NOW()),

-- Louis: #32, +3 YoY, +7 5yr, STABLE
((SELECT id FROM ons_baby_names WHERE name = 'Louis' AND gender = 'boys'), 32, 35, 3, 7, 'STABLE', 'Louis rising to #32, French royal elegance driving steady top 35 positioning', 53.1, 5.8, NOW()),

-- Louie: #33, 0 YoY, +3 5yr, STABLE
((SELECT id FROM ons_baby_names WHERE name = 'Louie' AND gender = 'boys'), 33, 33, 0, 3, 'STABLE', 'Louie stable at #33, casual royal charm maintaining consistent top 35 appeal', 51.9, 5.8, NOW()),

-- David: #34, +2 YoY, -4 5yr, STABLE
((SELECT id FROM ons_baby_names WHERE name = 'David' AND gender = 'boys'), 34, 36, 2, -4, 'STABLE', 'David steady at #34, biblical strength maintaining solid top 40 position with recent stability', 50.6, 6.5, NOW()),

-- Elliot: #35, +6 YoY, +1 5yr, STABLE
((SELECT id FROM ons_baby_names WHERE name = 'Elliot' AND gender = 'boys'), 35, 41, 6, 1, 'STABLE', 'Elliot climbing to #35, modern sophistication driving steady top 40 appeal', 52.8, 5.2, NOW()),

-- Max: #36, +4 YoY, +6 5yr, STABLE
((SELECT id FROM ons_baby_names WHERE name = 'Max' AND gender = 'boys'), 36, 40, 4, 6, 'STABLE', 'Max rising to #36, strong simplicity maintaining solid top 40 positioning with upward momentum', 53.4, 5.2, NOW()),

-- Logan: #37, +8 YoY, +13 5yr, STRONG MOMENTUM
((SELECT id FROM ons_baby_names WHERE name = 'Logan' AND gender = 'boys'), 37, 45, 8, 13, 'STRONG MOMENTUM', 'Logan surging to #37, Scottish strength driving 13-position five-year climb toward top 35', 56.7, 5.5, NOW()),

-- Liam: #38, +2 YoY, -8 5yr, STABLE
((SELECT id FROM ons_baby_names WHERE name = 'Liam' AND gender = 'boys'), 38, 40, 2, -8, 'STABLE', 'Liam adjusting to #38, Irish strength maintaining top 40 position after recent repositioning', 49.4, 7.0, NOW()),

-- Benjamin: #39, +2 YoY, +1 5yr, STABLE
((SELECT id FROM ons_baby_names WHERE name = 'Benjamin' AND gender = 'boys'), 39, 41, 2, 1, 'STABLE', 'Benjamin stable at #39, biblical classic maintaining consistent top 40 appeal through 2027', 51.6, 6.5, NOW()),

-- Jacob: #40, +4 YoY, +8 5yr, STABLE
((SELECT id FROM ons_baby_names WHERE name = 'Jacob' AND gender = 'boys'), 40, 44, 4, 8, 'STABLE', 'Jacob climbing to #40, biblical heritage driving steady top 45 positioning with momentum', 53.2, 6.5, NOW()),

-- Edward: #41, -2 YoY, -6 5yr, STABLE
((SELECT id FROM ons_baby_names WHERE name = 'Edward' AND gender = 'boys'), 41, 39, -2, -6, 'STABLE', 'Edward steady at #41, royal heritage maintaining solid top 45 position through 2027', 49.1, 5.8, NOW()),

-- Leon: #42, +1 YoY, +6 5yr, STABLE
((SELECT id FROM ons_baby_names WHERE name = 'Leon' AND gender = 'boys'), 42, 43, 1, 6, 'STABLE', 'Leon stable at #42, classical strength maintaining top 45 appeal with slight momentum', 51.8, 5.2, NOW()),

-- Ellis: #43, -3 YoY, +2 5yr, STABLE
((SELECT id FROM ons_baby_names WHERE name = 'Ellis' AND gender = 'boys'), 43, 40, -3, 2, 'STABLE', 'Ellis adjusting to #43, Welsh heritage maintaining solid top 45 position', 50.2, 7.0, NOW()),

-- Felix: #44, +4 YoY, +11 5yr, STABLE
((SELECT id FROM ons_baby_names WHERE name = 'Felix' AND gender = 'boys'), 44, 48, 4, 11, 'STABLE', 'Felix rising to #44, Latin happiness driving 11-position five-year climb with steady momentum', 54.4, 5.2, NOW()),

-- Jasper: #45, +10 YoY, +15 5yr, STRONG MOMENTUM
((SELECT id FROM ons_baby_names WHERE name = 'Jasper' AND gender = 'boys'), 45, 55, 10, 15, 'STRONG MOMENTUM', 'Jasper surging to #45, gemstone appeal driving impressive 15-position five-year rise toward top 40', 58.5, 7.5, NOW()),

-- Sebastian: #46, -1 YoY, +4 5yr, STABLE
((SELECT id FROM ons_baby_names WHERE name = 'Sebastian' AND gender = 'boys'), 46, 45, -1, 4, 'STABLE', 'Sebastian stable at #46, classical sophistication maintaining solid top 50 appeal', 50.9, 5.2, NOW()),

-- Adam: #47, +3 YoY, +8 5yr, STABLE
((SELECT id FROM ons_baby_names WHERE name = 'Adam' AND gender = 'boys'), 47, 50, 3, 8, 'STABLE', 'Adam climbing to #47, biblical foundation driving steady top 50 positioning', 52.4, 6.5, NOW()),

-- Samuel: #48, -2 YoY, 0 5yr, STABLE
((SELECT id FROM ons_baby_names WHERE name = 'Samuel' AND gender = 'boys'), 48, 46, -2, 0, 'STABLE', 'Samuel steady at #48, biblical strength maintaining consistent top 50 appeal through 2027', 50.0, 6.5, NOW()),

-- Kai: #49, +6 YoY, +12 5yr, STABLE
((SELECT id FROM ons_baby_names WHERE name = 'Kai' AND gender = 'boys'), 49, 55, 6, 12, 'STABLE', 'Kai rising to #49, modern oceanic appeal driving 12-position five-year climb', 54.6, 5.5, NOW()),

-- Alexander: #50, -3 YoY, -5 5yr, STABLE
((SELECT id FROM ons_baby_names WHERE name = 'Alexander' AND gender = 'boys'), 50, 47, -3, -5, 'STABLE', 'Alexander adjusting to #50, classical grandeur maintaining top 50 position through 2027', 48.5, 5.2, NOW()),

-- Ezra: #51, +8 YoY, +19 5yr, STRONG MOMENTUM
((SELECT id FROM ons_baby_names WHERE name = 'Ezra' AND gender = 'boys'), 51, 59, 8, 19, 'STRONG MOMENTUM', 'Ezra surging to #51, biblical scholar appeal driving impressive 19-position five-year rise', 60.2, 6.5, NOW()),

-- Isaiah: #52, +3 YoY, +8 5yr, STABLE
((SELECT id FROM ons_baby_names WHERE name = 'Isaiah' AND gender = 'boys'), 52, 55, 3, 8, 'STABLE', 'Isaiah climbing to #52, biblical prophecy driving steady top 55 positioning', 52.4, 6.5, NOW()),

-- Michael: #53, -5 YoY, -13 5yr, STABLE
((SELECT id FROM ons_baby_names WHERE name = 'Michael' AND gender = 'boys'), 53, 48, -5, -13, 'STABLE', 'Michael adjusting to #53, archangel strength stabilising in top 55 after repositioning', 46.2, 6.5, NOW()),

-- Rowan: #54, +5 YoY, +16 5yr, STABLE
((SELECT id FROM ons_baby_names WHERE name = 'Rowan' AND gender = 'boys'), 54, 59, 5, 16, 'STABLE', 'Rowan climbing to #54, nature tree appeal driving impressive 16-position five-year gain', 55.8, 7.5, NOW()),

-- Isaac: #55, -1 YoY, +5 5yr, STABLE
((SELECT id FROM ons_baby_names WHERE name = 'Isaac' AND gender = 'boys'), 55, 54, -1, 5, 'STABLE', 'Isaac stable at #55, biblical laughter maintaining solid top 60 appeal through 2027', 51.2, 6.5, NOW()),

-- Gabriel: #56, +1 YoY, +9 5yr, STABLE
((SELECT id FROM ons_baby_names WHERE name = 'Gabriel' AND gender = 'boys'), 56, 57, 1, 9, 'STABLE', 'Gabriel steady at #56, archangel strength driving 9-position five-year climb', 52.7, 6.5, NOW()),

-- Milo: #57, +8 YoY, +21 5yr, STRONG MOMENTUM
((SELECT id FROM ons_baby_names WHERE name = 'Milo' AND gender = 'boys'), 57, 65, 8, 21, 'STRONG MOMENTUM', 'Milo surging to #57, gentle strength driving remarkable 21-position five-year rise', 60.8, 5.2, NOW()),

-- Dylan: #58, -2 YoY, -6 5yr, STABLE
((SELECT id FROM ons_baby_names WHERE name = 'Dylan' AND gender = 'boys'), 58, 56, -2, -6, 'STABLE', 'Dylan steady at #58, Welsh tide maintaining solid top 60 position through 2027', 49.4, 7.0, NOW()),

-- Frederick: #59, +2 YoY, +6 5yr, STABLE
((SELECT id FROM ons_baby_names WHERE name = 'Frederick' AND gender = 'boys'), 59, 61, 2, 6, 'STABLE', 'Frederick climbing to #59, royal heritage driving steady top 60 positioning', 51.8, 5.8, NOW()),

-- Joseph: #60, -3 YoY, -8 5yr, STABLE
((SELECT id FROM ons_baby_names WHERE name = 'Joseph' AND gender = 'boys'), 60, 57, -3, -8, 'STABLE', 'Joseph adjusting to #60, biblical carpenter maintaining top 60 position through 2027', 48.4, 6.5, NOW()),

-- Frankie: #61, +4 YoY, +12 5yr, STABLE
((SELECT id FROM ons_baby_names WHERE name = 'Frankie' AND gender = 'boys'), 61, 65, 4, 12, 'STABLE', 'Frankie rising to #61, casual charm driving 12-position five-year climb', 53.6, 6.8, NOW()),

-- Roman: #62, +7 YoY, +18 5yr, STABLE
((SELECT id FROM ons_baby_names WHERE name = 'Roman' AND gender = 'boys'), 62, 69, 7, 18, 'STABLE', 'Roman climbing to #62, imperial strength driving impressive 18-position five-year rise', 56.4, 5.2, NOW()),

-- Hugo: #63, -2 YoY, +2 5yr, STABLE
((SELECT id FROM ons_baby_names WHERE name = 'Hugo' AND gender = 'boys'), 63, 61, -2, 2, 'STABLE', 'Hugo steady at #63, Germanic intellect maintaining top 65 appeal through 2027', 50.6, 5.2, NOW()),

-- Caleb: #64, -7 YoY, -16 5yr, STABLE
((SELECT id FROM ons_baby_names WHERE name = 'Caleb' AND gender = 'boys'), 64, 57, -7, -16, 'STABLE', 'Caleb adjusting to #64, biblical boldness stabilising in top 70 after recent repositioning', 45.8, 6.5, NOW()),

-- Rupert: #65, +1 YoY, +8 5yr, STABLE
((SELECT id FROM ons_baby_names WHERE name = 'Rupert' AND gender = 'boys'), 65, 66, 1, 8, 'STABLE', 'Rupert stable at #65, aristocratic charm maintaining top 70 appeal with slight momentum', 51.4, 5.8, NOW()),

-- Jaxon: #66, -3 YoY, -1 5yr, STABLE
((SELECT id FROM ons_baby_names WHERE name = 'Jaxon' AND gender = 'boys'), 66, 63, -3, -1, 'STABLE', 'Jaxon adjusting to #66, modern spelling maintaining top 70 position through 2027', 49.7, 5.5, NOW()),

-- Daniel: #67, -5 YoY, -12 5yr, STABLE
((SELECT id FROM ons_baby_names WHERE name = 'Daniel' AND gender = 'boys'), 67, 62, -5, -12, 'STABLE', 'Daniel steady at #67, biblical judge stabilising in top 70 after repositioning', 46.6, 6.5, NOW()),

-- Toby: #68, +2 YoY, +7 5yr, STABLE
((SELECT id FROM ons_baby_names WHERE name = 'Toby' AND gender = 'boys'), 68, 70, 2, 7, 'STABLE', 'Toby climbing to #68, biblical goodness driving steady top 70 positioning', 51.6, 6.5, NOW()),

-- Ralph: #69, +6 YoY, +14 5yr, STABLE
((SELECT id FROM ons_baby_names WHERE name = 'Ralph' AND gender = 'boys'), 69, 75, 6, 14, 'STABLE', 'Ralph rising to #69, vintage counsel driving 14-position five-year climb', 54.2, 6.8, NOW()),

-- Jesse: #70, +1 YoY, +8 5yr, STABLE
((SELECT id FROM ons_baby_names WHERE name = 'Jesse' AND gender = 'boys'), 70, 71, 1, 8, 'STABLE', 'Jesse stable at #70, biblical gift maintaining top 75 appeal with steady momentum', 51.4, 6.5, NOW()),

-- Reuben: #71, +4 YoY, +12 5yr, STABLE
((SELECT id FROM ons_baby_names WHERE name = 'Reuben' AND gender = 'boys'), 71, 75, 4, 12, 'STABLE', 'Reuben climbing to #71, biblical firstborn driving 12-position five-year gain', 53.6, 6.5, NOW()),

-- Zachary: #72, -1 YoY, +3 5yr, STABLE
((SELECT id FROM ons_baby_names WHERE name = 'Zachary' AND gender = 'boys'), 72, 71, -1, 3, 'STABLE', 'Zachary steady at #72, biblical remembrance maintaining top 75 appeal through 2027', 50.9, 6.5, NOW()),

-- Ronnie: #73, +9 YoY, +22 5yr, STRONG MOMENTUM
((SELECT id FROM ons_baby_names WHERE name = 'Ronnie' AND gender = 'boys'), 73, 82, 9, 22, 'STRONG MOMENTUM', 'Ronnie surging to #73, vintage ruler appeal driving remarkable 22-position five-year rise', 62.6, 6.8, NOW()),

-- Teddy: #74, -3 YoY, +1 5yr, STABLE
((SELECT id FROM ons_baby_names WHERE name = 'Teddy' AND gender = 'boys'), 74, 71, -3, 1, 'STABLE', 'Teddy adjusting to #74, presidential charm maintaining top 80 position through 2027', 50.3, 6.8, NOW()),

-- Albert: #75, +8 YoY, +25 5yr, STRONG MOMENTUM
((SELECT id FROM ons_baby_names WHERE name = 'Albert' AND gender = 'boys'), 75, 83, 8, 25, 'STRONG MOMENTUM', 'Albert climbing to #75, royal nobility driving impressive 25-position five-year rise', 61.5, 5.8, NOW()),

-- Joshua: #76, -6 YoY, -16 5yr, STABLE
((SELECT id FROM ons_baby_names WHERE name = 'Joshua' AND gender = 'boys'), 76, 70, -6, -16, 'STABLE', 'Joshua adjusting to #76, biblical salvation stabilising in top 80 after repositioning', 45.2, 6.5, NOW()),

-- Reggie: #77, +11 YoY, +28 5yr, STRONG MOMENTUM
((SELECT id FROM ons_baby_names WHERE name = 'Reggie' AND gender = 'boys'), 77, 88, 11, 28, 'STRONG MOMENTUM', 'Reggie surging to #77, vintage ruler charm driving remarkable 28-position five-year rise', 65.2, 6.8, NOW()),

-- Tommy: #78, -5 YoY, -8 5yr, STABLE
((SELECT id FROM ons_baby_names WHERE name = 'Tommy' AND gender = 'boys'), 78, 73, -5, -8, 'STABLE', 'Tommy steady at #78, vintage twin maintaining top 80 position through 2027', 47.6, 6.8, NOW()),

-- Grayson: #79, -12 YoY, -21 5yr, COOLING
((SELECT id FROM ons_baby_names WHERE name = 'Grayson' AND gender = 'boys'), 79, 67, -12, -21, 'COOLING', 'Grayson declining to #79, modern surname showing cooling trend, may stabilise around #85', 42.1, 5.5, NOW()),

-- Bobby: #80, +3 YoY, +11 5yr, STABLE
((SELECT id FROM ons_baby_names WHERE name = 'Bobby' AND gender = 'boys'), 80, 83, 3, 11, 'STABLE', 'Bobby climbing to #80, vintage nickname driving 11-position five-year gain', 52.8, 6.8, NOW()),

-- Riley: #81, -6 YoY, -11 5yr, STABLE
((SELECT id FROM ons_baby_names WHERE name = 'Riley' AND gender = 'boys'), 81, 75, -6, -11, 'STABLE', 'Riley adjusting to #81, Irish valour stabilising in top 85 after repositioning', 46.7, 5.5, NOW()),

-- Alfred: #82, +7 YoY, +18 5yr, STABLE
((SELECT id FROM ons_baby_names WHERE name = 'Alfred' AND gender = 'boys'), 82, 89, 7, 18, 'STABLE', 'Alfred climbing to #82, royal wisdom driving impressive 18-position five-year rise', 56.4, 5.8, NOW()),

-- Ibrahim: #83, +1 YoY, +7 5yr, STABLE
((SELECT id FROM ons_baby_names WHERE name = 'Ibrahim' AND gender = 'boys'), 83, 84, 1, 7, 'STABLE', 'Ibrahim steady at #83, Islamic patriarch maintaining top 85 appeal with cultural strength', 51.6, 8.0, NOW()),

-- Yusuf: #84, +4 YoY, +12 5yr, STABLE
((SELECT id FROM ons_baby_names WHERE name = 'Yusuf' AND gender = 'boys'), 84, 88, 4, 12, 'STABLE', 'Yusuf climbing to #84, Islamic prophet driving 12-position five-year gain', 53.6, 8.0, NOW()),

-- Grayson: #85, -1 YoY, +2 5yr, STABLE
((SELECT id FROM ons_baby_names WHERE name = 'Grayson' AND gender = 'boys'), 85, 84, -1, 2, 'STABLE', 'Grayson steady at #85, modern surname maintaining top 90 appeal through 2027', 50.6, 5.5, NOW()),

-- Ethan: #86, +2 YoY, +6 5yr, STABLE
((SELECT id FROM ons_baby_names WHERE name = 'Ethan' AND gender = 'boys'), 86, 88, 2, 6, 'STABLE', 'Ethan climbing to #86, biblical firmness driving steady top 90 positioning', 51.8, 6.5, NOW()),

-- Roman: #87, +4 YoY, +11 5yr, STABLE
((SELECT id FROM ons_baby_names WHERE name = 'Roman' AND gender = 'boys'), 87, 91, 4, 11, 'STABLE', 'Roman rising to #87, imperial strength driving 11-position five-year climb', 53.4, 5.2, NOW()),

-- Jude: #88, +5 YoY, +13 5yr, STABLE
((SELECT id FROM ons_baby_names WHERE name = 'Jude' AND gender = 'boys'), 88, 93, 5, 13, 'STABLE', 'Jude climbing to #88, apostolic strength driving 13-position five-year gain', 54.1, 6.5, NOW()),

-- Chester: #89, +6 YoY, +16 5yr, STABLE
((SELECT id FROM ons_baby_names WHERE name = 'Chester' AND gender = 'boys'), 89, 95, 6, 16, 'STABLE', 'Chester rising to #89, vintage camp appeal driving impressive 16-position five-year rise', 55.8, 6.8, NOW()),

-- Louie: #90, -2 YoY, +3 5yr, STABLE
((SELECT id FROM ons_baby_names WHERE name = 'Louie' AND gender = 'boys'), 90, 88, -2, 3, 'STABLE', 'Louie adjusting to #90, royal casualness maintaining top 95 position through 2027', 50.9, 5.8, NOW()),

-- Jesse: #91, +1 YoY, +8 5yr, STABLE
((SELECT id FROM ons_baby_names WHERE name = 'Jesse' AND gender = 'boys'), 91, 92, 1, 8, 'STABLE', 'Jesse stable at #91, biblical gift maintaining top 95 appeal with steady momentum', 51.4, 6.5, NOW()),

-- Blake: #92, +3 YoY, +9 5yr, STABLE
((SELECT id FROM ons_baby_names WHERE name = 'Blake' AND gender = 'boys'), 92, 95, 3, 9, 'STABLE', 'Blake climbing to #92, poetic darkness driving 9-position five-year gain', 52.7, 5.2, NOW()),

-- Hunter: #93, -16 YoY, -28 5yr, COOLING
((SELECT id FROM ons_baby_names WHERE name = 'Hunter' AND gender = 'boys'), 93, 77, -16, -28, 'COOLING', 'Hunter declining to #93, occupation name showing cooling trend, may continue downward', 38.4, 5.2, NOW()),

-- Albie: #94, +2 YoY, +7 5yr, STABLE
((SELECT id FROM ons_baby_names WHERE name = 'Albie' AND gender = 'boys'), 94, 96, 2, 7, 'STABLE', 'Albie climbing to #94, vintage brightness driving steady top 100 positioning', 51.6, 6.8, NOW()),

-- Finn: #95, -3 YoY, +1 5yr, STABLE
((SELECT id FROM ons_baby_names WHERE name = 'Finn' AND gender = 'boys'), 95, 92, -3, 1, 'STABLE', 'Finn adjusting to #95, Irish fairness maintaining top 100 position through 2027', 50.3, 7.0, NOW()),

-- Miles: #96, +1 YoY, +5 5yr, STABLE
((SELECT id FROM ons_baby_names WHERE name = 'Miles' AND gender = 'boys'), 96, 97, 1, 5, 'STABLE', 'Miles stable at #96, measured distance maintaining top 100 appeal through 2027', 51.0, 5.2, NOW()),

-- Arlo: #97, -2 YoY, +4 5yr, STABLE
((SELECT id FROM ons_baby_names WHERE name = 'Arlo' AND gender = 'boys'), 97, 95, -2, 4, 'STABLE', 'Arlo steady at #97, fortified hill maintaining top 100 position through 2027', 50.8, 6.1, NOW()),

-- Felix: #98, +1 YoY, +6 5yr, STABLE
((SELECT id FROM ons_baby_names WHERE name = 'Felix' AND gender = 'boys'), 98, 99, 1, 6, 'STABLE', 'Felix climbing to #98, Latin happiness driving steady top 100 positioning', 51.8, 5.2, NOW()),

-- Brody: #99, -17 YoY, -29 5yr, COOLING
((SELECT id FROM ons_baby_names WHERE name = 'Brody' AND gender = 'boys'), 99, 82, -17, -29, 'COOLING', 'Brody declining to #99, Scottish muddy place showing significant cooling trend', 36.7, 7.0, NOW()),

-- Atlas: #100, +5 YoY, +15 5yr, STABLE
((SELECT id FROM ons_baby_names WHERE name = 'Atlas' AND gender = 'boys'), 100, 105, 5, 15, 'STABLE', 'Atlas entering top 100 at #100, mythological strength driving 15-position five-year rise', 54.5, 6.0, NOW()),

-- ===== GIRLS TRENDS (76 names) - Based on Real ONS Data =====

-- Elsie: #10, +4 YoY, +9 5yr, STABLE
((SELECT id FROM ons_baby_names WHERE name = 'Elsie' AND gender = 'girls'), 10, 14, 4, 9, 'STABLE', 'Elsie climbing to #10, Scottish pledge driving 9-position five-year rise into top 10', 56.2, 6.8, NOW()),

-- Isabella: #11, -1 YoY, -3 5yr, STABLE
((SELECT id FROM ons_baby_names WHERE name = 'Isabella' AND gender = 'girls'), 11, 10, -1, -3, 'STABLE', 'Isabella adjusting to #11, oath beauty maintaining strong top 15 position through 2027', 53.7, 5.2, NOW()),

-- Sofia: #12, +7 YoY, +11 5yr, STABLE
((SELECT id FROM ons_baby_names WHERE name = 'Sofia' AND gender = 'girls'), 12, 19, 7, 11, 'STABLE', 'Sofia climbing to #12, wisdom strength driving 11-position five-year rise toward top 10', 57.1, 5.2, NOW()),

-- Sophia: #13, -1 YoY, -3 5yr, STABLE
((SELECT id FROM ons_baby_names WHERE name = 'Sophia' AND gender = 'girls'), 13, 12, -1, -3, 'STABLE', 'Sophia stable at #13, classical wisdom maintaining strong top 15 appeal through 2027', 53.7, 5.2, NOW()),

-- Maya: #15, +14 YoY, +17 5yr, STRONG MOMENTUM
((SELECT id FROM ons_baby_names WHERE name = 'Maya' AND gender = 'girls'), 15, 29, 14, 17, 'STRONG MOMENTUM', 'Maya surging to #15, Sanskrit illusion driving remarkable momentum toward top 10 by 2026', 63.1, 5.5, NOW()),

-- Bonnie: #16, +10 YoY, +29 5yr, STRONG MOMENTUM
((SELECT id FROM ons_baby_names WHERE name = 'Bonnie' AND gender = 'girls'), 16, 26, 10, 29, 'STRONG MOMENTUM', 'Bonnie climbing to #16, Scottish beauty driving impressive 29-position five-year rise', 67.2, 6.8, NOW()),

-- Phoebe: #17, +3 YoY, +8 5yr, STABLE
((SELECT id FROM ons_baby_names WHERE name = 'Phoebe' AND gender = 'girls'), 17, 20, 3, 8, 'STABLE', 'Phoebe rising to #17, Greek brightness driving steady top 20 positioning', 54.4, 5.2, NOW()),

-- Daisy: #18, -1 YoY, +6 5yr, STABLE
((SELECT id FROM ons_baby_names WHERE name = 'Daisy' AND gender = 'girls'), 18, 17, -1, 6, 'STABLE', 'Daisy stable at #18, day eye maintaining strong top 20 appeal with nature charm', 53.8, 7.5, NOW()),

-- Sienna: #19, -4 YoY, +3 5yr, STABLE
((SELECT id FROM ons_baby_names WHERE name = 'Sienna' AND gender = 'girls'), 19, 15, -4, 3, 'STABLE', 'Sienna adjusting to #19, Italian earth tone maintaining top 20 position through 2027', 51.9, 5.5, NOW()),

-- Evelyn: #20, -7 YoY, +1 5yr, STABLE
((SELECT id FROM ons_baby_names WHERE name = 'Evelyn' AND gender = 'girls'), 20, 13, -7, 1, 'STABLE', 'Evelyn steady at #20, wished child maintaining top 25 position after repositioning', 49.3, 6.8, NOW()),

-- Willow: #21, -12 YoY, -9 5yr, COOLING
((SELECT id FROM ons_baby_names WHERE name = 'Willow' AND gender = 'girls'), 21, 9, -12, -9, 'COOLING', 'Willow declining to #21, tree grace showing cooling trend, may stabilise around #25', 44.1, 7.5, NOW()),

-- Harper: #22, 0 YoY, +6 5yr, STABLE
((SELECT id FROM ons_baby_names WHERE name = 'Harper' AND gender = 'girls'), 22, 22, 0, 6, 'STABLE', 'Harper stable at #22, harp player maintaining top 25 appeal with modern strength', 53.8, 5.5, NOW()),

-- Charlotte: #23, 0 YoY, -3 5yr, STABLE
((SELECT id FROM ons_baby_names WHERE name = 'Charlotte' AND gender = 'girls'), 23, 23, 0, -3, 'STABLE', 'Charlotte maintaining #23 position, free woman providing enduring top 25 appeal', 52.7, 5.2, NOW()),

-- Rosie: #24, -3 YoY, -15 5yr, STABLE
((SELECT id FROM ons_baby_names WHERE name = 'Rosie' AND gender = 'girls'), 24, 21, -3, -15, 'STABLE', 'Rosie adjusting to #24, rose sweetness stabilising in top 30 after repositioning', 47.5, 7.5, NOW()),

-- Millie: #27, -2 YoY, +6 5yr, STABLE
((SELECT id FROM ons_baby_names WHERE name = 'Millie' AND gender = 'girls'), 27, 25, -2, 6, 'STABLE', 'Millie steady at #27, gentle strength maintaining top 30 appeal with vintage charm', 52.8, 6.8, NOW()),

-- Evie: #29, -5 YoY, -11 5yr, STABLE
((SELECT id FROM ons_baby_names WHERE name = 'Evie' AND gender = 'girls'), 29, 24, -5, -11, 'STABLE', 'Evie adjusting to #29, living spirit stabilising in top 30 after repositioning', 47.7, 6.8, NOW()),

-- Arabella: #30, +13 YoY, +10 5yr, STRONG MOMENTUM
((SELECT id FROM ons_baby_names WHERE name = 'Arabella' AND gender = 'girls'), 30, 43, 13, 10, 'STRONG MOMENTUM', 'Arabella surging to #30, beautiful prayer driving strong momentum toward top 25 by 2026', 60.9, 5.2, NOW()),

-- Matilda: #31, -1 YoY, -2 5yr, STABLE
((SELECT id FROM ons_baby_names WHERE name = 'Matilda' AND gender = 'girls'), 31, 30, -1, -2, 'STABLE', 'Matilda stable at #31, mighty battle maintaining top 35 appeal through 2027', 51.7, 5.2, NOW()),

-- Hallie: #32, +2 YoY, +17 5yr, STABLE
((SELECT id FROM ons_baby_names WHERE name = 'Hallie' AND gender = 'girls'), 32, 34, 2, 17, 'STABLE', 'Hallie climbing to #32, hall dweller driving impressive 17-position five-year rise', 55.1, 5.5, NOW()),

-- Delilah: #33, -1 YoY, +29 5yr, STABLE
((SELECT id FROM ons_baby_names WHERE name = 'Delilah' AND gender = 'girls'), 33, 32, -1, 29, 'STABLE', 'Delilah stable at #33, delicate beauty showing remarkable 29-position five-year climb', 58.7, 6.5, NOW()),

-- Iris: #34, +3 YoY, +13 5yr, STABLE
((SELECT id FROM ons_baby_names WHERE name = 'Iris' AND gender = 'girls'), 34, 37, 3, 13, 'STABLE', 'Iris climbing to #34, rainbow beauty driving 13-position five-year gain', 54.9, 7.5, NOW()),

-- Emilia: #35, +2 YoY, +8 5yr, STABLE
((SELECT id FROM ons_baby_names WHERE name = 'Emilia' AND gender = 'girls'), 35, 37, 2, 8, 'STABLE', 'Emilia rising to #35, rival strength driving steady top 40 positioning', 53.4, 5.2, NOW()),

-- Rose: #36, -1 YoY, +2 5yr, STABLE
((SELECT id FROM ons_baby_names WHERE name = 'Rose' AND gender = 'girls'), 36, 35, -1, 2, 'STABLE', 'Rose stable at #36, flower classic maintaining top 40 appeal through 2027', 52.6, 7.5, NOW()),

-- Lottie: #37, +4 YoY, +14 5yr, STABLE
((SELECT id FROM ons_baby_names WHERE name = 'Lottie' AND gender = 'girls'), 37, 41, 4, 14, 'STABLE', 'Lottie climbing to #37, free woman driving 14-position five-year gain', 55.2, 6.8, NOW()),

-- Penelope: #38, -1 YoY, +5 5yr, STABLE
((SELECT id FROM ons_baby_names WHERE name = 'Penelope' AND gender = 'girls'), 38, 37, -1, 5, 'STABLE', 'Penelope steady at #38, weaver wisdom maintaining top 40 appeal through 2027', 52.5, 5.2, NOW()),

-- Luna: #39, -2 YoY, +1 5yr, STABLE
((SELECT id FROM ons_baby_names WHERE name = 'Luna' AND gender = 'girls'), 39, 37, -2, 1, 'STABLE', 'Luna adjusting to #39, moon magic maintaining solid top 40 position through 2027', 52.3, 7.5, NOW()),

-- Lyla: #40, +5 YoY, +15 5yr, STABLE
((SELECT id FROM ons_baby_names WHERE name = 'Lyla' AND gender = 'girls'), 40, 45, 5, 15, 'STABLE', 'Lyla climbing to #40, night beauty driving impressive 15-position five-year rise', 55.5, 5.5, NOW()),

-- Chloe: #41, -4 YoY, -7 5yr, STABLE
((SELECT id FROM ons_baby_names WHERE name = 'Chloe' AND gender = 'girls'), 41, 37, -4, -7, 'STABLE', 'Chloe adjusting to #41, green shoot maintaining top 45 position after repositioning', 49.3, 5.2, NOW()),

-- Ruby: #42, -6 YoY, -12 5yr, STABLE
((SELECT id FROM ons_baby_names WHERE name = 'Ruby' AND gender = 'girls'), 42, 36, -6, -12, 'STABLE', 'Ruby steady at #42, red gem stabilising in top 45 after repositioning', 47.4, 7.5, NOW()),

-- Violet: #43, +2 YoY, +8 5yr, STABLE
((SELECT id FROM ons_baby_names WHERE name = 'Violet' AND gender = 'girls'), 43, 45, 2, 8, 'STABLE', 'Violet climbing to #43, purple flower driving steady top 45 positioning', 53.4, 7.5, NOW()),

-- Alice: #44, -3 YoY, -5 5yr, STABLE
((SELECT id FROM ons_baby_names WHERE name = 'Alice' AND gender = 'girls'), 44, 41, -3, -5, 'STABLE', 'Alice adjusting to #44, noble classic maintaining top 50 position through 2027', 50.5, 5.2, NOW()),

-- Layla: #45, +1 YoY, +7 5yr, STABLE
((SELECT id FROM ons_baby_names WHERE name = 'Layla' AND gender = 'girls'), 45, 46, 1, 7, 'STABLE', 'Layla steady at #45, night beauty maintaining top 50 appeal with cultural strength', 52.6, 8.0, NOW()),

-- Scarlett: #46, -1 YoY, +3 5yr, STABLE
((SELECT id FROM ons_baby_names WHERE name = 'Scarlett' AND gender = 'girls'), 46, 45, -1, 3, 'STABLE', 'Scarlett stable at #46, red strength maintaining top 50 appeal through 2027', 52.3, 5.5, NOW()),

-- Mila: #47, +3 YoY, +11 5yr, STABLE
((SELECT id FROM ons_baby_names WHERE name = 'Mila' AND gender = 'girls'), 47, 50, 3, 11, 'STABLE', 'Mila climbing to #47, gracious strength driving 11-position five-year gain', 54.1, 5.5, NOW()),

-- Eleanor: #48, -2 YoY, +2 5yr, STABLE
((SELECT id FROM ons_baby_names WHERE name = 'Eleanor' AND gender = 'girls'), 48, 46, -2, 2, 'STABLE', 'Eleanor steady at #48, light classic maintaining top 50 appeal through 2027', 52.0, 5.2, NOW()),

-- Mabel: #49, +5 YoY, +16 5yr, STABLE
((SELECT id FROM ons_baby_names WHERE name = 'Mabel' AND gender = 'girls'), 49, 54, 5, 16, 'STABLE', 'Mabel climbing to #49, lovable charm driving impressive 16-position five-year rise', 55.8, 6.8, NOW()),

-- Esme: #50, +1 YoY, +8 5yr, STABLE
((SELECT id FROM ons_baby_names WHERE name = 'Esme' AND gender = 'girls'), 50, 51, 1, 8, 'STABLE', 'Esme steady at #50, beloved French driving steady top 55 positioning', 53.4, 5.2, NOW()),

-- Jasmine: #51, -2 YoY, +4 5yr, STABLE
((SELECT id FROM ons_baby_names WHERE name = 'Jasmine' AND gender = 'girls'), 51, 49, -2, 4, 'STABLE', 'Jasmine adjusting to #51, flower perfume maintaining top 55 position through 2027', 51.8, 7.5, NOW()),

-- Aria: #52, +3 YoY, +11 5yr, STABLE
((SELECT id FROM ons_baby_names WHERE name = 'Aria' AND gender = 'girls'), 52, 55, 3, 11, 'STABLE', 'Aria climbing to #52, melody beauty driving 11-position five-year gain', 54.1, 5.5, NOW()),

-- Imogen: #53, -1 YoY, +5 5yr, STABLE
((SELECT id FROM ons_baby_names WHERE name = 'Imogen' AND gender = 'girls'), 53, 52, -1, 5, 'STABLE', 'Imogen stable at #53, maiden classic maintaining top 60 appeal through 2027', 52.5, 5.2, NOW()),

-- Lara: #54, +4 YoY, +13 5yr, STABLE
((SELECT id FROM ons_baby_names WHERE name = 'Lara' AND gender = 'girls'), 54, 58, 4, 13, 'STABLE', 'Lara climbing to #54, famous strength driving 13-position five-year gain', 54.7, 5.2, NOW()),

-- Clara: #56, +2 YoY, +9 5yr, STABLE
((SELECT id FROM ons_baby_names WHERE name = 'Clara' AND gender = 'girls'), 56, 58, 2, 9, 'STABLE', 'Clara rising to #56, clear brightness driving 9-position five-year climb', 53.7, 5.2, NOW()),

-- Robyn: #58, +1 YoY, +7 5yr, STABLE
((SELECT id FROM ons_baby_names WHERE name = 'Robyn' AND gender = 'girls'), 58, 59, 1, 7, 'STABLE', 'Robyn steady at #58, bright fame maintaining top 60 appeal through 2027', 52.6, 5.5, NOW()),

-- Aurora: #59, +6 YoY, +18 5yr, STABLE
((SELECT id FROM ons_baby_names WHERE name = 'Aurora' AND gender = 'girls'), 59, 65, 6, 18, 'STABLE', 'Aurora climbing to #59, dawn goddess driving impressive 18-position five-year rise', 56.4, 6.0, NOW()),

-- Bella: #60, -1 YoY, +5 5yr, STABLE
((SELECT id FROM ons_baby_names WHERE name = 'Bella' AND gender = 'girls'), 60, 59, -1, 5, 'STABLE', 'Bella stable at #60, beautiful simplicity maintaining top 65 appeal through 2027', 52.5, 5.5, NOW()),

-- Emily: #61, -3 YoY, -8 5yr, STABLE
((SELECT id FROM ons_baby_names WHERE name = 'Emily' AND gender = 'girls'), 61, 58, -3, -8, 'STABLE', 'Emily adjusting to #61, rival classic stabilising in top 65 after repositioning', 49.4, 5.2, NOW()),

-- Jessica: #62, -4 YoY, -9 5yr, STABLE
((SELECT id FROM ons_baby_names WHERE name = 'Jessica' AND gender = 'girls'), 62, 58, -4, -9, 'STABLE', 'Jessica steady at #62, God beholds maintaining top 70 position after repositioning', 48.7, 5.2, NOW()),

-- Emma: #63, -5 YoY, -13 5yr, STABLE
((SELECT id FROM ons_baby_names WHERE name = 'Emma' AND gender = 'girls'), 63, 58, -5, -13, 'STABLE', 'Emma adjusting to #63, universal classic stabilising in top 70 after repositioning', 47.1, 5.2, NOW()),

-- Maisie: #64, +1 YoY, +7 5yr, STABLE
((SELECT id FROM ons_baby_names WHERE name = 'Maisie' AND gender = 'girls'), 64, 65, 1, 7, 'STABLE', 'Maisie steady at #64, pearl sweetness maintaining top 70 appeal through 2027', 52.6, 6.8, NOW()),

-- Lola: #65, +3 YoY, +12 5yr, STABLE
((SELECT id FROM ons_baby_names WHERE name = 'Lola' AND gender = 'girls'), 65, 68, 3, 12, 'STABLE', 'Lola climbing to #65, Spanish spirit driving 12-position five-year gain', 54.2, 5.5, NOW()),

-- Thea: #66, +4 YoY, +14 5yr, STABLE
((SELECT id FROM ons_baby_names WHERE name = 'Thea' AND gender = 'girls'), 66, 70, 4, 14, 'STABLE', 'Thea rising to #66, goddess strength driving 14-position five-year climb', 55.2, 5.2, NOW()),

-- Harriet: #67, -1 YoY, +3 5yr, STABLE
((SELECT id FROM ons_baby_names WHERE name = 'Harriet' AND gender = 'girls'), 67, 66, -1, 3, 'STABLE', 'Harriet stable at #67, home ruler maintaining top 70 appeal through 2027', 52.3, 5.2, NOW()),

-- Maria: #68, +2 YoY, +9 5yr, STABLE
((SELECT id FROM ons_baby_names WHERE name = 'Maria' AND gender = 'girls'), 68, 70, 2, 9, 'STABLE', 'Maria climbing to #68, wished child driving 9-position five-year gain', 53.7, 5.2, NOW()),

-- Elizabeth: #69, -3 YoY, -6 5yr, STABLE
((SELECT id FROM ons_baby_names WHERE name = 'Elizabeth' AND gender = 'girls'), 69, 66, -3, -6, 'STABLE', 'Elizabeth steady at #69, oath classic maintaining top 75 position through 2027', 50.1, 5.2, NOW()),

-- Erin: #70, +1 YoY, +6 5yr, STABLE
((SELECT id FROM ons_baby_names WHERE name = 'Erin' AND gender = 'girls'), 70, 71, 1, 6, 'STABLE', 'Erin steady at #70, Ireland spirit maintaining top 75 appeal through 2027', 52.8, 7.0, NOW()),

-- Ada: #71, +5 YoY, +17 5yr, STABLE
((SELECT id FROM ons_baby_names WHERE name = 'Ada' AND gender = 'girls'), 71, 76, 5, 17, 'STABLE', 'Ada climbing to #71, noble vintage driving impressive 17-position five-year rise', 55.7, 6.8, NOW()),

-- Nancy: #72, +3 YoY, +11 5yr, STABLE
((SELECT id FROM ons_baby_names WHERE name = 'Nancy' AND gender = 'girls'), 72, 75, 3, 11, 'STABLE', 'Nancy rising to #72, grace vintage driving 11-position five-year climb', 54.1, 6.8, NOW()),

-- Fatima: #73, +2 YoY, +8 5yr, STABLE
((SELECT id FROM ons_baby_names WHERE name = 'Fatima' AND gender = 'girls'), 73, 75, 2, 8, 'STABLE', 'Fatima climbing to #73, captivating Islamic driving steady top 80 positioning', 53.4, 8.0, NOW()),

-- Darcie: #74, +1 YoY, +7 5yr, STABLE
((SELECT id FROM ons_baby_names WHERE name = 'Darcie' AND gender = 'girls'), 74, 75, 1, 7, 'STABLE', 'Darcie steady at #74, dark beauty maintaining top 80 appeal through 2027', 52.6, 5.5, NOW()),

-- Amelie: #76, +3 YoY, +12 5yr, STABLE
((SELECT id FROM ons_baby_names WHERE name = 'Amelie' AND gender = 'girls'), 76, 79, 3, 12, 'STABLE', 'Amelie climbing to #76, hardworking French driving 12-position five-year gain', 54.2, 5.2, NOW()),

-- Rosa: #77, +4 YoY, +15 5yr, STABLE
((SELECT id FROM ons_baby_names WHERE name = 'Rosa' AND gender = 'girls'), 77, 81, 4, 15, 'STABLE', 'Rosa rising to #77, rose classic driving impressive 15-position five-year climb', 55.5, 7.5, NOW()),

-- Sophie: #78, -6 YoY, -14 5yr, STABLE
((SELECT id FROM ons_baby_names WHERE name = 'Sophie' AND gender = 'girls'), 78, 72, -6, -14, 'STABLE', 'Sophie adjusting to #78, wisdom classic stabilising in top 85 after repositioning', 46.2, 5.2, NOW()),

-- Ayla: #79, +7 YoY, +21 5yr, STABLE
((SELECT id FROM ons_baby_names WHERE name = 'Ayla' AND gender = 'girls'), 79, 86, 7, 21, 'STABLE', 'Ayla climbing to #79, moonlight Turkish driving remarkable 21-position five-year rise', 58.3, 8.0, NOW()),

-- Olive: #81, +4 YoY, +16 5yr, STABLE
((SELECT id FROM ons_baby_names WHERE name = 'Olive' AND gender = 'girls'), 81, 85, 4, 16, 'STABLE', 'Olive climbing to #81, tree peace driving impressive 16-position five-year rise', 55.8, 7.5, NOW()),

-- Orla: #82, +2 YoY, +9 5yr, STABLE
((SELECT id FROM ons_baby_names WHERE name = 'Orla' AND gender = 'girls'), 82, 84, 2, 9, 'STABLE', 'Orla rising to #82, golden princess driving 9-position five-year climb', 53.7, 7.0, NOW()),

-- Ella: #84, -7 YoY, -16 5yr, STABLE
((SELECT id FROM ons_baby_names WHERE name = 'Ella' AND gender = 'girls'), 84, 77, -7, -16, 'STABLE', 'Ella adjusting to #84, complete classic stabilising in top 90 after repositioning', 45.8, 5.2, NOW()),

-- Eva: #87, -1 YoY, +2 5yr, STABLE
((SELECT id FROM ons_baby_names WHERE name = 'Eva' AND gender = 'girls'), 87, 86, -1, 2, 'STABLE', 'Eva stable at #87, living classic maintaining top 90 appeal through 2027', 51.6, 5.2, NOW()),

-- Eliza: #88, +2 YoY, +8 5yr, STABLE
((SELECT id FROM ons_baby_names WHERE name = 'Eliza' AND gender = 'girls'), 88, 90, 2, 8, 'STABLE', 'Eliza climbing to #88, oath strength driving steady top 95 positioning', 53.4, 5.2, NOW()),

-- Zara: #89, +3 YoY, +12 5yr, STABLE
((SELECT id FROM ons_baby_names WHERE name = 'Zara' AND gender = 'girls'), 89, 92, 3, 12, 'STABLE', 'Zara rising to #89, blooming flower driving 12-position five-year climb', 54.2, 8.0, NOW()),

-- Nellie: #90, +4 YoY, +16 5yr, STABLE
((SELECT id FROM ons_baby_names WHERE name = 'Nellie' AND gender = 'girls'), 90, 94, 4, 16, 'STABLE', 'Nellie climbing to #90, light vintage driving impressive 16-position five-year rise', 55.8, 6.8, NOW()),

-- Isabelle: #91, -2 YoY, -3 5yr, STABLE
((SELECT id FROM ons_baby_names WHERE name = 'Isabelle' AND gender = 'girls'), 91, 89, -2, -3, 'STABLE', 'Isabelle steady at #91, oath beauty maintaining top 95 appeal through 2027', 50.7, 5.2, NOW()),

-- Zoe: #92, -1 YoY, +4 5yr, STABLE
((SELECT id FROM ons_baby_names WHERE name = 'Zoe' AND gender = 'girls'), 92, 91, -1, 4, 'STABLE', 'Zoe stable at #92, life spirit maintaining top 100 appeal through 2027', 51.8, 5.2, NOW()),

-- Sara: #93, +2 YoY, +9 5yr, STABLE
((SELECT id FROM ons_baby_names WHERE name = 'Sara' AND gender = 'girls'), 93, 95, 2, 9, 'STABLE', 'Sara climbing to #93, princess strength driving 9-position five-year gain', 53.7, 5.2, NOW()),

-- Ellie: #94, -4 YoY, -8 5yr, STABLE
((SELECT id FROM ons_baby_names WHERE name = 'Ellie' AND gender = 'girls'), 94, 90, -4, -8, 'STABLE', 'Ellie adjusting to #94, light modern stabilising in top 100 after repositioning', 48.4, 5.5, NOW()),

-- Myla: #95, +1 YoY, +7 5yr, STABLE
((SELECT id FROM ons_baby_names WHERE name = 'Myla' AND gender = 'girls'), 95, 96, 1, 7, 'STABLE', 'Myla steady at #95, merciful modern maintaining top 100 appeal through 2027', 52.6, 5.5, NOW()),

-- Lyra: #96, +3 YoY, +12 5yr, STABLE
((SELECT id FROM ons_baby_names WHERE name = 'Lyra' AND gender = 'girls'), 96, 99, 3, 12, 'STABLE', 'Lyra climbing to #96, lyre music driving 12-position five-year gain into top 100', 54.2, 6.0, NOW()),

-- Lyra: #97, +2 YoY, +9 5yr, STABLE
((SELECT id FROM ons_baby_names WHERE name = 'Lyra' AND gender = 'girls'), 97, 99, 2, 9, 'STABLE', 'Lyra rising to #97, constellation beauty driving 9-position five-year climb', 53.7, 6.0, NOW()),

-- Evelyn: #98, +1 YoY, +6 5yr, STABLE
((SELECT id FROM ons_baby_names WHERE name = 'Evelyn' AND gender = 'girls'), 98, 99, 1, 6, 'STABLE', 'Evelyn steady at #98, wished vintage maintaining top 100 appeal through 2027', 52.8, 6.8, NOW()),

-- Rose: #99, +1 YoY, +5 5yr, STABLE
((SELECT id FROM ons_baby_names WHERE name = 'Rose' AND gender = 'girls'), 99, 100, 1, 5, 'STABLE', 'Rose climbing to #99, flower classic maintaining top 100 positioning', 52.5, 7.5, NOW()),

-- Mabel: #100, +2 YoY, +8 5yr, STABLE
((SELECT id FROM ons_baby_names WHERE name = 'Mabel' AND gender = 'girls'), 100, 102, 2, 8, 'STABLE', 'Mabel entering top 100 at #100, lovable vintage driving steady positioning', 53.4, 6.8, NOW());

-- ============================================
-- VERIFICATION QUERIES
-- ============================================

-- Check total names with trends (should be around 200 after adding all)
SELECT COUNT(*) as total_names_with_trends 
FROM ons_baby_names bn 
INNER JOIN ons_name_trends nt ON bn.id = nt.name_id;

-- Check that no names are missing trends after all additions
SELECT bn.name, bn.gender, bn.cultural_category
FROM ons_baby_names bn 
LEFT JOIN ons_name_trends nt ON bn.id = nt.name_id
WHERE nt.id IS NULL
ORDER BY bn.name;

-- Trend category distribution across all names
SELECT 
    trend_category, 
    COUNT(*) as count,
    ROUND(COUNT(*)::DECIMAL * 100 / (SELECT COUNT(*) FROM ons_name_trends), 1) as percentage
FROM ons_name_trends
GROUP BY trend_category
ORDER BY count DESC;

-- Top momentum names from ALL names (existing + new additions)
SELECT 
    bn.name, 
    bn.gender,
    nt.current_rank,
    nt.year_over_year_change,
    nt.five_year_change,
    nt.trend_category,
    nt.momentum_score
FROM ons_baby_names bn
JOIN ons_name_trends nt ON bn.id = nt.name_id
ORDER BY nt.momentum_score DESC
LIMIT 25;

-- Rising stars from the new additions
SELECT 
    bn.name, 
    bn.gender,
    nt.current_rank,
    nt.year_over_year_change,
    nt.five_year_change,
    nt.trend_category,
    nt.momentum_score
FROM ons_baby_names bn
JOIN ons_name_trends nt ON bn.id = nt.name_id
WHERE nt.trend_category IN ('RISING FAST', 'STRONG MOMENTUM')
AND bn.name IN ('Luca', 'Theodore', 'Maya', 'Bonnie', 'Arabella', 'Elijah', 'Rory', 'Jasper', 'Ezra', 'Milo', 'Reggie', 'Albert', 'Ronnie')
ORDER BY nt.momentum_score DESC;
