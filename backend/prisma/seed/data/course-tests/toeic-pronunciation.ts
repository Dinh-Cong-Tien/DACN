import type { AuthoredTest } from './types';

const ODD_S = "Chọn từ có phần đuôi -s/-es được phát âm khác với các từ còn lại";
const ODD_ED = "Chọn từ có phần đuôi -ed được phát âm khác với các từ còn lại";
const S_ES = "Chọn cách phát âm đúng của đuôi -s/-es";
const ED = "Chọn cách phát âm đúng của đuôi -ed";

export const TESTS: AuthoredTest[] = [
  {
    lessonId: '7d770e78-e745-4f01-a999-c3b9f600f129',
    title: 'Ôn tập chặng 1',
    prompt: "Chọn đáp án đúng",
    type: 'phoneme',
    questions: [
      {
        prompt: "Chọn từ chứa nguyên âm dài /iː/",
        text: "Từ nào có nguyên âm được đọc là /iː/?",
        options: ["seat", "sit", "set", "sat"],
        explain: "seat /siːt/ có nguyên âm dài /iː/ (dấu ː là âm dài). sit /sɪt/ là /ɪ/ ngắn, set /set/ là /e/, sat /sæt/ là /æ/.",
      },
      {
        prompt: "Chọn phụ âm hữu thanh",
        text: "Âm nào dưới đây là phụ âm hữu thanh (cổ họng rung khi đọc)?",
        options: ["/v/", "/f/", "/s/", "/k/"],
        explain: "/v/ là âm hữu thanh, cặp với /f/ vô thanh. /f/, /s/, /k/ đều vô thanh nên cổ họng không rung.",
      },
      {
        text: "Đuôi -s trong từ \"clients\" được phát âm là",
        options: ["/s/", "/z/", "/ɪz/"],
        explain: "clients /ˈklaɪənts/ có âm cuối gốc /t/ là âm vô thanh nên đuôi -s đọc /s/.",
      },
      {
        text: "Đuôi -ed trong từ \"delivered\" được phát âm là",
        options: ["/d/", "/t/", "/ɪd/"],
        explain: "deliver /dɪˈlɪvə/ kết thúc bằng nguyên âm /ə/ (hữu thanh), không phải /t/ hay /d/, nên -ed đọc /d/: /dɪˈlɪvəd/.",
      },
      {
        prompt: "Chọn từ có trọng âm rơi vào âm tiết thứ nhất",
        text: "Từ nào được nhấn ở âm tiết đầu?",
        options: ["product", "agree", "invite", "explain"],
        explain: "Danh từ hai âm tiết thường nhấn âm tiết 1: product /ˈprɒdʌkt/. agree, invite, explain là động từ nên nhấn âm tiết 2.",
      },
      {
        prompt: "Chọn âm tiết mang trọng âm",
        text: "Trọng âm của từ \"registration\" rơi vào âm tiết nào?",
        options: ["Âm tiết 3 (-tra-)", "Âm tiết 1 (re-)", "Âm tiết 2 (-gis-)", "Âm tiết 4 (-tion)"],
        explain: "Từ có đuôi -tion nhấn vào âm tiết ngay trước -tion: registration /ˌredʒɪˈstreɪʃn/, trọng âm ở -tra-.",
      },
      {
        prompt: "Chọn âm tiết mang trọng âm",
        text: "Our firm plans to export more coffee next year. Từ \"export\" trong câu được nhấn ở đâu?",
        options: ["Âm tiết 2 (-port)", "Âm tiết 1 (ex-)", "Cả hai âm tiết như nhau"],
        explain: "Ở đây export đứng sau \"to\" nên là động từ, nhấn âm tiết 2: /ɪkˈspɔːt/. Khi là danh từ (hàng xuất khẩu) mới nhấn âm tiết 1 /ˈekspɔːt/.",
      },
      {
        type: 'grammar-gap',
        prompt: "Chọn dạng từ đúng điền vào chỗ trống",
        text: "The manager gave a very _____ presentation to the board.",
        options: ["impressive", "impress", "impression", "impressively"],
        explain: "Sau trạng từ \"very\" và trước danh từ \"presentation\" cần một tính từ; hậu tố -ive tạo tính từ nên chọn impressive.",
      },
      {
        type: 'grammar-gap',
        prompt: "Chọn dạng từ đúng điền vào chỗ trống",
        text: "Please enter the figures _____ before submitting the report.",
        options: ["accurately", "accurate", "accuracy", "inaccurate"],
        explain: "Chỗ trống bổ nghĩa cho động từ \"enter\" nên cần trạng từ; hậu tố -ly tạo trạng từ: accurately.",
      },
      {
        type: 'grammar-gap',
        prompt: "Chọn dạng từ đúng điền vào chỗ trống",
        text: "The _____ of a new branch in Da Nang took almost two years.",
        options: ["establishment", "establish", "established", "establishes"],
        explain: "Sau mạo từ \"The\" và trước \"of\" cần danh từ làm chủ ngữ; hậu tố -ment tạo danh từ: establishment.",
      },
    ],
  },
  {
    lessonId: 'b10f96ab-b7d9-4335-9806-65f6d7e3ee34',
    title: 'Bài tập s/es',
    prompt: S_ES,
    type: 'phoneme',
    questions: [
      {
        text: "Đuôi -s trong từ \"maps\" được phát âm là",
        options: ["/s/", "/z/", "/ɪz/"],
        explain: "maps /mæps/ có âm cuối gốc /p/ vô thanh nên -s đọc /s/.",
      },
      {
        text: "Đuôi -s trong từ \"trees\" được phát âm là",
        options: ["/z/", "/s/", "/ɪz/"],
        explain: "tree /triː/ kết thúc bằng nguyên âm /iː/ (hữu thanh) nên -s đọc /z/: /triːz/.",
      },
      {
        text: "Đuôi -es trong từ \"boxes\" được phát âm là",
        options: ["/ɪz/", "/s/", "/z/"],
        explain: "Chữ x đọc /ks/, âm cuối là âm rít /s/ nên -es đọc /ɪz/: /ˈbɒksɪz/.",
      },
      {
        text: "Đuôi -s trong từ \"hats\" được phát âm là",
        options: ["/s/", "/z/", "/ɪz/"],
        explain: "hats /hæts/ có âm cuối gốc /t/ vô thanh nên -s đọc /s/.",
      },
      {
        text: "Đuôi -s trong từ \"dogs\" được phát âm là",
        options: ["/z/", "/s/", "/ɪz/"],
        explain: "dog /dɒɡ/ kết thúc bằng /ɡ/ hữu thanh nên -s đọc /z/: /dɒɡz/.",
      },
      {
        prompt: ODD_S,
        text: "Nhóm từ: dishes, cakes, ships, roofs",
        options: ["dishes", "cakes", "ships", "roofs"],
        explain: "dishes /ˈdɪʃɪz/ có âm cuối gốc /ʃ/ là âm rít nên đọc /ɪz/; cakes /keɪks/, ships /ʃɪps/, roofs /ruːfs/ kết thúc bằng âm vô thanh nên đọc /s/.",
      },
    ],
  },
  {
    lessonId: '091d4d53-d707-4912-a1c8-7c35c8557c3e',
    title: 'Bài tập đuôi ed',
    prompt: ED,
    type: 'phoneme',
    questions: [
      {
        text: "Đuôi -ed trong từ \"jumped\" được phát âm là",
        options: ["/t/", "/d/", "/ɪd/"],
        explain: "jump /dʒʌmp/ kết thúc bằng /p/ vô thanh nên -ed đọc /t/: /dʒʌmpt/.",
      },
      {
        text: "Đuôi -ed trong từ \"visited\" được phát âm là",
        options: ["/ɪd/", "/t/", "/d/"],
        explain: "visit kết thúc bằng âm /t/ nên -ed thêm một âm tiết /ɪd/: /ˈvɪzɪtɪd/.",
      },
      {
        text: "Đuôi -ed trong từ \"rained\" được phát âm là",
        options: ["/d/", "/t/", "/ɪd/"],
        explain: "rain /reɪn/ kết thúc bằng /n/ hữu thanh nên -ed đọc /d/: /reɪnd/.",
      },
      {
        text: "Đuôi -ed trong từ \"loved\" được phát âm là",
        options: ["/d/", "/t/", "/ɪd/"],
        explain: "love /lʌv/ kết thúc bằng âm /v/ hữu thanh (chữ e câm) nên -ed đọc /d/: /lʌvd/.",
      },
      {
        prompt: ODD_ED,
        text: "Nhóm từ: painted, looked, dropped, fixed",
        options: ["painted", "looked", "dropped", "fixed"],
        explain: "painted /ˈpeɪntɪd/ có gốc kết thúc bằng /t/ nên đọc /ɪd/; looked, dropped, fixed kết thúc bằng âm vô thanh /k/, /p/, /s/ nên đọc /t/.",
      },
      {
        prompt: "Chọn từ có đuôi -ed được phát âm là /d/",
        text: "Từ nào có đuôi -ed đọc là /d/?",
        options: ["smiled", "talked", "hoped", "landed"],
        explain: "smile kết thúc bằng /l/ hữu thanh nên smiled /smaɪld/ đọc /d/; talked, hoped đọc /t/, landed đọc /ɪd/.",
      },
    ],
  },
  {
    lessonId: '52ac0182-387b-4e88-813a-eb63dc675ffb',
    title: 'Bài tập s/es 2',
    prompt: S_ES,
    type: 'phoneme',
    questions: [
      {
        text: "Đuôi -es trong từ \"studies\" được phát âm là",
        options: ["/z/", "/s/", "/ɪz/"],
        explain: "study /ˈstʌdi/ kết thúc bằng nguyên âm /i/ nên -es đọc /z/: /ˈstʌdiz/. Chữ -ies không thêm âm tiết /ɪz/.",
      },
      {
        text: "He cooks dinner for his family every evening. Đuôi -s trong \"cooks\" được phát âm là",
        options: ["/s/", "/z/", "/ɪz/"],
        explain: "cook /kʊk/ kết thúc bằng /k/ vô thanh nên -s đọc /s/: /kʊks/.",
      },
      {
        text: "Đuôi -s trong từ \"closes\" (đóng cửa) được phát âm là",
        options: ["/ɪz/", "/s/", "/z/"],
        explain: "close (động từ) /kləʊz/ kết thúc bằng âm rít /z/ nên -s đọc /ɪz/: /ˈkləʊzɪz/. Chữ e câm không quyết định, âm cuối mới quyết định.",
      },
      {
        text: "She lives near the city center. Đuôi -s trong \"lives\" được phát âm là",
        options: ["/z/", "/s/", "/ɪz/"],
        explain: "live /lɪv/ kết thúc bằng /v/ hữu thanh nên -s đọc /z/: /lɪvz/.",
      },
      {
        prompt: ODD_S,
        text: "Nhóm từ: runs, helps, eats, sleeps",
        options: ["runs", "helps", "eats", "sleeps"],
        explain: "runs /rʌnz/ có âm cuối /n/ hữu thanh nên đọc /z/; helps, eats, sleeps kết thúc bằng /p/, /t/ vô thanh nên đọc /s/.",
      },
      {
        prompt: ODD_S,
        text: "Nhóm từ: likes, teaches, misses, uses",
        options: ["likes", "teaches", "misses", "uses"],
        explain: "likes /laɪks/ kết thúc bằng /k/ vô thanh nên đọc /s/; teaches, misses, uses có âm cuối rít /tʃ/, /s/, /z/ nên đọc /ɪz/.",
      },
    ],
  },
  {
    lessonId: 'c7cfd129-6d06-4289-ad0d-d9e457b597b5',
    title: 'Bài tập ed 2',
    prompt: ED,
    type: 'phoneme',
    questions: [
      {
        text: "Đuôi -ed trong từ \"laughed\" được phát âm là",
        options: ["/t/", "/d/", "/ɪd/"],
        explain: "Chữ gh trong laugh đọc /f/ (vô thanh) nên -ed đọc /t/: /lɑːft/.",
      },
      {
        text: "Đuôi -ed trong từ \"invited\" được phát âm là",
        options: ["/ɪd/", "/t/", "/d/"],
        explain: "invite /ɪnˈvaɪt/ kết thúc bằng âm /t/ nên -ed đọc /ɪd/: /ɪnˈvaɪtɪd/.",
      },
      {
        text: "Đuôi -ed trong từ \"planned\" được phát âm là",
        options: ["/d/", "/t/", "/ɪd/"],
        explain: "plan /plæn/ kết thúc bằng /n/ hữu thanh nên -ed đọc /d/: /plænd/ (gấp đôi chữ n không đổi cách đọc).",
      },
      {
        text: "Đuôi -ed trong từ \"finished\" được phát âm là",
        options: ["/t/", "/d/", "/ɪd/"],
        explain: "finish kết thúc bằng /ʃ/ vô thanh nên -ed đọc /t/: /ˈfɪnɪʃt/.",
      },
      {
        prompt: ODD_ED,
        text: "Nhóm từ: arrived, passed, reached, asked",
        options: ["arrived", "passed", "reached", "asked"],
        explain: "arrive kết thúc bằng /v/ hữu thanh nên arrived /əˈraɪvd/ đọc /d/; passed, reached, asked kết thúc bằng /s/, /tʃ/, /k/ vô thanh nên đọc /t/.",
      },
      {
        prompt: "Chọn từ có đuôi -ed được phát âm là /ɪd/",
        text: "Từ nào có đuôi -ed đọc là /ɪd/?",
        options: ["attended", "allowed", "packed", "showed"],
        explain: "attend kết thúc bằng /d/ nên attended /əˈtendɪd/ đọc /ɪd/; allowed, showed đọc /d/, packed đọc /t/.",
      },
    ],
  },
  {
    lessonId: '8f26f2a4-e44d-4388-a4fd-e1047c24437d',
    title: 'Bài tập s/es 3',
    prompt: S_ES,
    type: 'phoneme',
    questions: [
      {
        text: "Đuôi -s trong từ \"coughs\" (ho) được phát âm là",
        options: ["/s/", "/z/", "/ɪz/"],
        explain: "Chữ gh trong cough /kɒf/ đọc /f/ vô thanh nên -s đọc /s/: /kɒfs/.",
      },
      {
        text: "Đuôi -s trong từ \"pages\" được phát âm là",
        options: ["/ɪz/", "/z/", "/s/"],
        explain: "page /peɪdʒ/ kết thúc bằng âm rít /dʒ/ nên -s đọc /ɪz/: /ˈpeɪdʒɪz/.",
      },
      {
        text: "Đuôi -s trong từ \"breathes\" (động từ: thở) được phát âm là",
        options: ["/z/", "/s/", "/ɪz/"],
        explain: "breathe /briːð/ kết thúc bằng /ð/ hữu thanh (khác /θ/ của danh từ breath) nên -s đọc /z/: /briːðz/.",
      },
      {
        text: "Đuôi -s trong từ \"myths\" được phát âm là",
        options: ["/s/", "/z/", "/ɪz/"],
        explain: "myth /mɪθ/ kết thúc bằng /θ/ vô thanh nên -s đọc /s/: /mɪθs/.",
      },
      {
        prompt: ODD_S,
        text: "Nhóm từ: photos, prices, roses, sizes",
        options: ["photos", "prices", "roses", "sizes"],
        explain: "photo /ˈfəʊtəʊ/ kết thúc bằng nguyên âm nên photos đọc /z/; prices, roses, sizes có âm cuối rít /s/, /z/ nên đọc /ɪz/.",
      },
      {
        prompt: ODD_S,
        text: "Nhóm từ: judges, graphs, tapes, notes",
        options: ["judges", "graphs", "tapes", "notes"],
        explain: "judge kết thúc bằng âm rít /dʒ/ nên judges /ˈdʒʌdʒɪz/ đọc /ɪz/; graphs (ph = /f/), tapes, notes kết thúc bằng âm vô thanh nên đọc /s/.",
      },
    ],
  },
  {
    lessonId: '59f58ef1-4de6-4cd2-bd03-906deec95072',
    title: 'Bài tập ed 3',
    prompt: ED,
    type: 'phoneme',
    questions: [
      {
        text: "Đuôi -ed trong từ \"faxed\" được phát âm là",
        options: ["/t/", "/d/", "/ɪd/"],
        explain: "Chữ x đọc /ks/, âm cuối /s/ vô thanh nên -ed đọc /t/: /fækst/.",
      },
      {
        text: "Đuôi -ed trong từ \"produced\" được phát âm là",
        options: ["/t/", "/d/", "/ɪd/"],
        explain: "Đuôi -ce trong produce đọc /s/ vô thanh nên -ed đọc /t/: /prəˈdjuːst/.",
      },
      {
        text: "Đuôi -ed trong từ \"changed\" được phát âm là",
        options: ["/d/", "/t/", "/ɪd/"],
        explain: "change /tʃeɪndʒ/ kết thúc bằng /dʒ/ hữu thanh nên -ed đọc /d/: /tʃeɪndʒd/.",
      },
      {
        text: "Đuôi -ed trong từ \"recommended\" được phát âm là",
        options: ["/ɪd/", "/d/", "/t/"],
        explain: "recommend kết thúc bằng /d/ nên -ed đọc /ɪd/: /ˌrekəˈmendɪd/.",
      },
      {
        prompt: ODD_ED,
        text: "Nhóm từ: received, promoted, completed, updated",
        options: ["received", "promoted", "completed", "updated"],
        explain: "receive kết thúc bằng /v/ hữu thanh nên received /rɪˈsiːvd/ đọc /d/; promoted, completed, updated có gốc kết thúc bằng /t/ nên đọc /ɪd/.",
      },
      {
        prompt: ODD_ED,
        text: "Nhóm từ: raised, replaced, increased, noticed",
        options: ["raised", "replaced", "increased", "noticed"],
        explain: "raise /reɪz/ kết thúc bằng /z/ hữu thanh nên raised đọc /d/; replaced, increased, noticed có âm cuối /s/ vô thanh nên đọc /t/.",
      },
    ],
  },
  {
    lessonId: 'f703feb2-e1f6-4ca4-91d3-96e0dc250f35',
    title: 'Bài tập s/es 4',
    prompt: S_ES,
    type: 'phoneme',
    questions: [
      {
        text: "Mike's laptop is brand new. Phần 's trong \"Mike's\" được phát âm là",
        options: ["/s/", "/z/", "/ɪz/"],
        explain: "Sở hữu cách 's theo cùng quy tắc với -s: Mike /maɪk/ kết thúc bằng /k/ vô thanh nên đọc /s/.",
      },
      {
        text: "The boss's office is on the third floor. Phần 's trong \"boss's\" được phát âm là",
        options: ["/ɪz/", "/s/", "/z/"],
        explain: "boss /bɒs/ kết thúc bằng âm rít /s/ nên 's đọc /ɪz/: /ˈbɒsɪz/.",
      },
      {
        text: "Linda's car broke down this morning. Phần 's trong \"Linda's\" được phát âm là",
        options: ["/z/", "/s/", "/ɪz/"],
        explain: "Linda /ˈlɪndə/ kết thúc bằng nguyên âm /ə/ nên 's đọc /z/.",
      },
      {
        prompt: "Chọn từ có đuôi -s được phát âm là /ɪz/",
        text: "Ms. Tran writes emails, checks invoices and answers calls. Từ nào có đuôi đọc là /ɪz/?",
        options: ["invoices", "writes", "emails", "answers"],
        explain: "invoice kết thúc bằng âm /s/ nên invoices /ˈɪnvɔɪsɪz/ đọc /ɪz/; writes đọc /s/, emails và answers đọc /z/.",
      },
      {
        prompt: ODD_S,
        text: "Nhóm từ: beliefs, garages, wishes, causes",
        options: ["beliefs", "garages", "wishes", "causes"],
        explain: "belief kết thúc bằng /f/ vô thanh nên beliefs /bɪˈliːfs/ đọc /s/; garages, wishes, causes có âm cuối rít (/ʒ/ hoặc /dʒ/, /ʃ/, /z/) nên đọc /ɪz/.",
      },
      {
        text: "Đuôi -s trong từ \"stomachs\" được phát âm là",
        options: ["/s/", "/z/", "/ɪz/"],
        explain: "Chữ ch trong stomach đọc /k/ (không phải /tʃ/) nên -s đọc /s/: /ˈstʌməks/, không thêm /ɪz/.",
      },
    ],
  },
  {
    lessonId: '853616c5-f165-4047-83fb-bdcf9131de7b',
    title: 'Bài tập ed 4',
    prompt: ED,
    type: 'phoneme',
    questions: [
      {
        text: "The flight was delayed by two hours. Đuôi -ed trong \"delayed\" được phát âm là",
        options: ["/d/", "/t/", "/ɪd/"],
        explain: "delay /dɪˈleɪ/ kết thúc bằng nguyên âm đôi /eɪ/ nên -ed đọc /d/: /dɪˈleɪd/.",
      },
      {
        text: "We discussed the budget at yesterday's meeting. Đuôi -ed trong \"discussed\" được phát âm là",
        options: ["/t/", "/d/", "/ɪd/"],
        explain: "discuss kết thúc bằng /s/ vô thanh nên -ed đọc /t/: /dɪˈskʌst/.",
      },
      {
        text: "The manager suggested a new schedule. Đuôi -ed trong \"suggested\" được phát âm là",
        options: ["/ɪd/", "/t/", "/d/"],
        explain: "suggest kết thúc bằng /t/ nên -ed đọc /ɪd/: /səˈdʒestɪd/.",
      },
      {
        prompt: "Chọn từ có đuôi -ed được phát âm là /t/",
        text: "Last year the company hired new staff, launched a product and expanded overseas. Từ nào có đuôi -ed đọc là /t/?",
        options: ["launched", "hired", "expanded"],
        explain: "launch kết thúc bằng /tʃ/ vô thanh nên launched /lɔːntʃt/ đọc /t/; hired đọc /d/ (gốc kết thúc bằng nguyên âm), expanded đọc /ɪd/.",
      },
      {
        text: "All online orders are processed within 24 hours. Đuôi -ed trong \"processed\" được phát âm là",
        options: ["/t/", "/d/", "/ɪd/"],
        explain: "process kết thúc bằng /s/ vô thanh nên -ed đọc /t/: /ˈprəʊsest/.",
      },
      {
        prompt: ODD_ED,
        text: "Nhóm từ: managed, rented, included, divided",
        options: ["managed", "rented", "included", "divided"],
        explain: "manage kết thúc bằng /dʒ/ (không phải /d/) nên managed /ˈmænɪdʒd/ đọc /d/; rented, included, divided có gốc kết thúc bằng /t/ hoặc /d/ nên đọc /ɪd/.",
      },
    ],
  },
  {
    lessonId: '475ab506-f49e-4fd6-8873-38ac52f28bbd',
    title: 'Bài tập s/es 5',
    prompt: S_ES,
    type: 'phoneme',
    questions: [
      {
        text: "Đuôi -s trong danh từ số nhiều \"houses\" được phát âm là",
        options: ["/ɪz/", "/z/", "/s/"],
        explain: "house kết thúc bằng âm rít /s/ nên số nhiều đọc thêm /ɪz/: /ˈhaʊzɪz/ (âm /s/ của gốc còn chuyển thành /z/).",
      },
      {
        text: "Đuôi -s trong từ \"knives\" được phát âm là",
        options: ["/z/", "/s/", "/ɪz/"],
        explain: "Số nhiều của knife đổi f thành v: knives /naɪvz/; âm cuối /v/ hữu thanh nên đọc /z/.",
      },
      {
        text: "Đuôi -s trong từ \"colleagues\" được phát âm là",
        options: ["/z/", "/s/", "/ɪz/"],
        explain: "Chữ -ue trong colleague câm, âm cuối là /ɡ/ hữu thanh nên -s đọc /z/: /ˈkɒliːɡz/.",
      },
      {
        text: "Đuôi -s trong từ \"techniques\" được phát âm là",
        options: ["/s/", "/z/", "/ɪz/"],
        explain: "Đuôi -que trong technique đọc /k/ vô thanh nên -s đọc /s/: /tekˈniːks/.",
      },
      {
        prompt: ODD_S,
        text: "Nhóm từ: chiefs, leaves, wolves, shelves",
        options: ["chiefs", "leaves", "wolves", "shelves"],
        explain: "chief giữ nguyên /f/ vô thanh nên chiefs /tʃiːfs/ đọc /s/; leaves, wolves, shelves đổi f thành /v/ hữu thanh nên đọc /z/.",
      },
      {
        prompt: "Chọn từ có đuôi -s/'s được phát âm là /ɪz/",
        text: "The director's assistant analyzes the company's sales figures. Từ nào có đuôi đọc là /ɪz/?",
        options: ["analyzes", "director's", "company's", "figures"],
        explain: "analyze /ˈænəlaɪz/ kết thúc bằng âm rít /z/ nên analyzes đọc /ɪz/; director's, company's, figures đều kết thúc bằng nguyên âm nên đọc /z/.",
      },
    ],
  },
  {
    lessonId: 'd528aaf9-7df5-4fe6-a139-edaee202c315',
    title: 'Bài tập ed 5',
    prompt: ED,
    type: 'phoneme',
    questions: [
      {
        text: "Đuôi -ed trong tính từ \"naked\" (trần trụi) được phát âm là",
        options: ["/ɪd/", "/t/", "/d/"],
        explain: "naked là tính từ ngoại lệ, -ed đọc /ɪd/: /ˈneɪkɪd/, dù gốc kết thúc bằng /k/.",
      },
      {
        text: "She is a learned professor of history. Đuôi -ed trong \"learned\" (uyên bác) được phát âm là",
        options: ["/ɪd/", "/d/", "/t/"],
        explain: "Khi là tính từ nghĩa \"uyên bác\", learned đọc /ˈlɜːnɪd/ với /ɪd/; còn động từ quá khứ learned (đã học) đọc /lɜːnd/.",
      },
      {
        text: "Đuôi -ed trong từ \"sacrificed\" được phát âm là",
        options: ["/t/", "/d/", "/ɪd/"],
        explain: "Đuôi -ce trong sacrifice đọc /s/ vô thanh nên -ed đọc /t/: /ˈsækrɪfaɪst/.",
      },
      {
        text: "Đuôi -ed trong từ \"acknowledged\" được phát âm là",
        options: ["/d/", "/t/", "/ɪd/"],
        explain: "acknowledge kết thúc bằng /dʒ/ hữu thanh (không phải /d/) nên -ed đọc /d/: /əkˈnɒlɪdʒd/.",
      },
      {
        prompt: ODD_ED,
        text: "Nhóm từ: wicked (tính từ: độc ác), booked, picked, knocked",
        options: ["wicked", "booked", "picked", "knocked"],
        explain: "wicked là tính từ ngoại lệ đọc /ˈwɪkɪd/ với /ɪd/; booked, picked, knocked là động từ quá khứ, gốc kết thúc bằng /k/ vô thanh nên đọc /t/.",
      },
      {
        prompt: "Chọn từ có đuôi -ed được phát âm là /d/",
        text: "Từ nào có đuôi -ed đọc là /d/? (measured, searched, brushed, crashed)",
        options: ["measured", "searched", "brushed", "crashed"],
        explain: "measure /ˈmeʒə/ kết thúc bằng nguyên âm /ə/ nên measured /ˈmeʒəd/ đọc /d/; searched, brushed, crashed kết thúc bằng /tʃ/, /ʃ/ vô thanh nên đọc /t/.",
      },
    ],
  },
];
