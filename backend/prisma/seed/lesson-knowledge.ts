/**
 * Nạp "Kiến thức trong bài" cho video bài giảng (lessons.knowledge) theo chủ đề trong tên bài, kèm cây mạo từ.
 * Chạy: npx tsx prisma/seed/lesson-knowledge.ts [--force]
 *  - mặc định chỉ điền bài chưa có kiến thức (không ghi đè nội dung admin đã sửa); --force ghi đè tất cả
 *  - khớp theo tên bài; không khớp gói nào thì thử theo tên chương
 */
import { Prisma } from '@prisma/client';
import { prisma } from './lib';
import { emptyKnowledge, isEmptyKnowledge, parseKnowledgeText, type KnowledgeNode, type LessonKnowledge } from '../../src/modules/catalog/lesson-knowledge';
import { GRAMMAR_PACKS } from './data/lesson-knowledge/grammar';
import { articleTree } from './data/lesson-knowledge/articles';
import { detectGrammar } from './data/lesson-knowledge/detect-grammar';
import { TOPIC_PACKS } from './data/lesson-knowledge/topics';

const PACKS = [...GRAMMAR_PACKS, ...TOPIC_PACKS];

/** Âm IPA → 3 từ ví dụ (từ | phiên âm | loại | nghĩa) cho chuỗi "42 Ngày Phát Âm" */
const PHONEME: Record<string, string[]> = {
  '/p/': ['pen | /pen/ | n | cái bút', 'happy | /ˈhæpi/ | adj | vui vẻ', 'stop | /stɒp/ | v | dừng lại'],
  '/b/': ['book | /bʊk/ | n | quyển sách', 'rubber | /ˈrʌbər/ | n | cục tẩy', 'job | /dʒɒb/ | n | công việc'],
  '/t/': ['time | /taɪm/ | n | thời gian', 'water | /ˈwɔːtər/ | n | nước', 'meet | /miːt/ | v | gặp'],
  '/d/': ['day | /deɪ/ | n | ngày', 'ladder | /ˈlædər/ | n | cái thang', 'need | /niːd/ | v | cần'],
  '/k/': ['cat | /kæt/ | n | con mèo', 'school | /skuːl/ | n | trường học', 'book | /bʊk/ | n | quyển sách'],
  '/g/': ['go | /ɡəʊ/ | v | đi', 'bigger | /ˈbɪɡər/ | adj | lớn hơn', 'bag | /bæɡ/ | n | cái túi'],
  '/f/': ['food | /fuːd/ | n | thức ăn', 'phone | /fəʊn/ | n | điện thoại', 'laugh | /lɑːf/ | v | cười'],
  '/v/': ['very | /ˈveri/ | adv | rất', 'seven | /ˈsevən/ | num | số bảy', 'love | /lʌv/ | v | yêu'],
  '/θ/': ['think | /θɪŋk/ | v | nghĩ', 'birthday | /ˈbɜːrθdeɪ/ | n | sinh nhật', 'month | /mʌnθ/ | n | tháng'],
  '/ð/': ['this | /ðɪs/ | det | cái này', 'mother | /ˈmʌðər/ | n | mẹ', 'breathe | /briːð/ | v | thở'],
  '/s/': ['sun | /sʌn/ | n | mặt trời', 'city | /ˈsɪti/ | n | thành phố', 'bus | /bʌs/ | n | xe buýt'],
  '/z/': ['zoo | /zuː/ | n | sở thú', 'busy | /ˈbɪzi/ | adj | bận', 'rose | /rəʊz/ | n | hoa hồng'],
  '/ʃ/': ['ship | /ʃɪp/ | n | con tàu', 'station | /ˈsteɪʃən/ | n | nhà ga', 'fish | /fɪʃ/ | n | con cá'],
  '/ʒ/': ['measure | /ˈmeʒər/ | v | đo', 'usually | /ˈjuːʒuəli/ | adv | thường xuyên', 'television | /ˈtelɪvɪʒən/ | n | ti vi'],
  '/tʃ/': ['chair | /tʃeər/ | n | cái ghế', 'teacher | /ˈtiːtʃər/ | n | giáo viên', 'watch | /wɒtʃ/ | v | xem'],
  '/dʒ/': ['job | /dʒɒb/ | n | công việc', 'manager | /ˈmænɪdʒər/ | n | quản lý', 'bridge | /brɪdʒ/ | n | cây cầu'],
  '/m/': ['money | /ˈmʌni/ | n | tiền', 'summer | /ˈsʌmər/ | n | mùa hè', 'name | /neɪm/ | n | tên'],
  '/n/': ['night | /naɪt/ | n | ban đêm', 'dinner | /ˈdɪnər/ | n | bữa tối', 'phone | /fəʊn/ | n | điện thoại'],
  '/ŋ/': ['sing | /sɪŋ/ | v | hát', 'morning | /ˈmɔːrnɪŋ/ | n | buổi sáng', 'English | /ˈɪŋɡlɪʃ/ | n | tiếng Anh'],
  '/h/': ['hello | /həˈləʊ/ | interj | xin chào', 'house | /haʊs/ | n | ngôi nhà', 'behind | /bɪˈhaɪnd/ | prep | phía sau'],
  '/l/': ['light | /laɪt/ | n | ánh sáng', 'hello | /həˈləʊ/ | interj | xin chào', 'call | /kɔːl/ | v | gọi'],
  '/r/': ['red | /red/ | adj | màu đỏ', 'sorry | /ˈsɒri/ | adj | xin lỗi', 'train | /treɪn/ | n | tàu hoả'],
  '/w/': ['water | /ˈwɔːtər/ | n | nước', 'week | /wiːk/ | n | tuần', 'quick | /kwɪk/ | adj | nhanh'],
  '/j/': ['yes | /jes/ | adv | vâng', 'you | /juː/ | pron | bạn', 'music | /ˈmjuːzɪk/ | n | âm nhạc'],
  '/ɪ/': ['sit | /sɪt/ | v | ngồi', 'ship | /ʃɪp/ | n | con tàu', 'busy | /ˈbɪzi/ | adj | bận'],
  '/e/': ['bed | /bed/ | n | cái giường', 'friend | /frend/ | n | bạn', 'many | /ˈmeni/ | det | nhiều'],
  '/æ/': ['cat | /kæt/ | n | con mèo', 'bag | /bæɡ/ | n | cái túi', 'happy | /ˈhæpi/ | adj | vui vẻ'],
  '/ʌ/': ['cup | /kʌp/ | n | cái cốc', 'money | /ˈmʌni/ | n | tiền', 'come | /kʌm/ | v | đến'],
  '/ɒ/': ['hot | /hɒt/ | adj | nóng', 'stop | /stɒp/ | v | dừng', 'watch | /wɒtʃ/ | v | xem'],
  '/ʊ/': ['book | /bʊk/ | n | quyển sách', 'good | /ɡʊd/ | adj | tốt', 'put | /pʊt/ | v | đặt'],
  '/ə/': ['about | /əˈbaʊt/ | prep | về', 'teacher | /ˈtiːtʃər/ | n | giáo viên', 'banana | /bəˈnɑːnə/ | n | quả chuối'],
  '/iː/': ['see | /siː/ | v | nhìn thấy', 'sheep | /ʃiːp/ | n | con cừu', 'people | /ˈpiːpəl/ | n | mọi người'],
  '/ɑː/': ['car | /kɑːr/ | n | ô tô', 'father | /ˈfɑːðər/ | n | bố', 'start | /stɑːrt/ | v | bắt đầu'],
  '/ɔː/': ['door | /dɔːr/ | n | cửa', 'talk | /tɔːk/ | v | nói chuyện', 'water | /ˈwɔːtər/ | n | nước'],
  '/uː/': ['food | /fuːd/ | n | thức ăn', 'blue | /bluː/ | adj | màu xanh dương', 'school | /skuːl/ | n | trường học'],
  '/ɜː/': ['bird | /bɜːrd/ | n | con chim', 'work | /wɜːrk/ | v | làm việc', 'learn | /lɜːrn/ | v | học'],
  '/eɪ/': ['day | /deɪ/ | n | ngày', 'name | /neɪm/ | n | tên', 'great | /ɡreɪt/ | adj | tuyệt vời'],
  '/aɪ/': ['time | /taɪm/ | n | thời gian', 'my | /maɪ/ | det | của tôi', 'buy | /baɪ/ | v | mua'],
  '/ɔɪ/': ['boy | /bɔɪ/ | n | cậu bé', 'choice | /tʃɔɪs/ | n | sự lựa chọn', 'enjoy | /ɪnˈdʒɔɪ/ | v | thích thú'],
  '/aʊ/': ['house | /haʊs/ | n | ngôi nhà', 'now | /naʊ/ | adv | bây giờ', 'about | /əˈbaʊt/ | prep | về'],
  '/əʊ/': ['go | /ɡəʊ/ | v | đi', 'phone | /fəʊn/ | n | điện thoại', 'know | /nəʊ/ | v | biết'],
  '/ɪə/': ['here | /hɪər/ | adv | ở đây', 'near | /nɪər/ | prep | gần', 'idea | /aɪˈdɪə/ | n | ý tưởng'],
};

/** Câu luyện đọc cho từng âm (dùng các từ ví dụ của âm đó) — ngữ pháp của bài lấy từ chính câu này */
const PRACTICE: Record<string, string> = {
  '/p/': "Please stop here – I can't find my pen.",
  '/b/': 'She has found a good job at the bookshop.',
  '/t/': 'We will meet at the same time tomorrow.',
  '/d/': 'I need a new ladder for the garden.',
  '/k/': 'The cat is sleeping on my school bag.',
  '/g/': 'If you go now, you will get a bigger bag.',
  '/f/': 'He laughed when the food arrived.',
  '/v/': 'I have lived here for seven years, and I love it very much.',
  '/θ/': 'I think her birthday is next month.',
  '/ð/': 'My mother bought this for me.',
  '/s/': 'The bus is faster than walking in this city.',
  '/z/': 'The zoo was busier than usual.',
  '/ʃ/': 'The ship has left the station.',
  '/ʒ/': 'I usually watch television in the evening.',
  '/tʃ/': 'The teacher asked us to bring our own chairs.',
  '/dʒ/': 'The manager is going to offer him a job.',
  '/m/': 'My name is Minh, and I love summer.',
  '/n/': 'We had dinner at night and then called him on the phone.',
  '/ŋ/': 'She is singing an English song this morning.',
  '/h/': 'Hello! Is there a hospital behind your house?',
  '/l/': 'Could you call me later?',
  '/r/': 'Sorry, the red train was cancelled.',
  '/w/': 'Could you bring me some water this week?',
  '/j/': 'Yes, you should listen to more music.',
  '/ɪ/': 'If it is busy, we will sit outside.',
  '/e/': 'Many of my friends went to bed early.',
  '/æ/': 'My cat is happier than your cat.',
  '/ʌ/': 'Come and have a cup of coffee with us.',
  '/ɒ/': "It's too hot, so let's stop and watch the sea.",
  '/ʊ/': 'Put the good book on the table.',
  '/ə/': 'The teacher was talking about bananas.',
  '/iː/': 'Can you see the sheep? People are watching them.',
  '/ɑː/': 'My father will start the car.',
  '/ɔː/': "Don't talk near the door.",
  '/uː/': 'Our school serves good food every day.',
  '/ɜː/': 'I have worked hard to learn English.',
  '/eɪ/': 'What is your name? Today is a great day.',
  '/aɪ/': 'I want to buy a new phone this time.',
  '/ɔɪ/': 'The boy enjoys playing football.',
  '/aʊ/': 'Our house is bigger than it was before.',
  '/əʊ/': 'Do you know where my phone is? I have to go.',
  '/ɪə/': 'Is there a bank near here?',
};

function merge(into: LessonKnowledge, k: LessonKnowledge) {
  const add = <T>(arr: T[], items: T[], key: (x: T) => string) => items.forEach((x) => !arr.some((y) => key(y) === key(x)) && arr.push(x));
  (['grammar', 'pronunciation', 'phrases', 'tips'] as const).forEach((s) => add(into[s], k[s], (g) => g.title.toLowerCase()));
  add(into.vocab, k.vocab, (v) => v.word.toLowerCase());
  add(into.clauses, k.clauses, (c) => c.title.toLowerCase());
  k.articles.forEach((n: KnowledgeNode) => {
    const same = into.articles.find((x) => x.label === n.label);
    if (!same) into.articles.push(n);
    else add((same.children ??= []), n.children ?? [], (c) => c.label);
  });
}

async function main() {
  const force = process.argv.includes('--force');
  const lessons = await prisma.lesson.findMany({
    where: { type: 'VIDEO', deletedAt: null, ...(force ? {} : { knowledge: { equals: Prisma.DbNull } }) },
    select: { id: true, title: true, section: { select: { title: true } } },
  });
  let filled = 0;
  const missed: string[] = [];
  for (const l of lessons) {
    const k = emptyKnowledge();
    const title = l.title.normalize('NFC').toLowerCase();
    const sound = l.title.match(/\/[^/]+\//)?.[0];
    if (sound && PHONEME[sound]) {
      // bài luyện 1 âm: mục Phát âm cho chính âm đó (3 từ ví dụ: đầu / giữa / cuối từ) + từ vựng
      const words = PHONEME[sound].map((w) => w.split('|').map((x) => x.trim()));
      const pron = `Âm ${sound} | ${words.map(([w, ipa]) => `${w} ${ipa}`).join(', ')} | Nghe và lặp lại âm ở đầu, giữa và cuối từ | ${words.map(([w]) => w).join(' – ')}`;
      const drill = PRACTICE[sound] ? `\nCâu luyện âm ${sound} | | Đọc to cả câu, chú ý âm ${sound} | ${PRACTICE[sound]}` : '';
      merge(k, parseKnowledgeText(`# Phát âm\n${pron}${drill}\n# Từ vựng\n${PHONEME[sound].join('\n')}`)!);
    } else {
      let hits = PACKS.filter((p) => p.match.test(title));
      if (!hits.length) hits = PACKS.filter((p) => p.match.test(l.section.title.normalize('NFC').toLowerCase()));
      hits.forEach((p) => merge(k, parseKnowledgeText(p.text)!));
    }
    if (isEmptyKnowledge(k)) {
      missed.push(`${l.section.title} › ${l.title}`);
      continue;
    }
    // ngữ pháp dùng trong chính các câu của bài (bài giao tiếp / phát âm / từ vựng chưa đủ mục ngữ pháp)
    if (k.grammar.length < 3) k.grammar.push(...detectGrammar(k, 4 - k.grammar.length));
    // cây mạo từ: a / an / the đi với những danh từ nào của chính bài này
    k.articles = articleTree(k);
    await prisma.lesson.update({ where: { id: l.id }, data: { knowledge: k as unknown as Prisma.InputJsonValue } });
    filled++;
  }
  console.log(`Đã điền kiến thức cho ${filled}/${lessons.length} video.`);
  if (missed.length) console.log('Chưa khớp chủ đề:\n  ' + missed.join('\n  '));
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
