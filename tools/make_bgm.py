# 우주·눈나라·공룡섬 필드 배경음악을 코드로 직접 합성해서 audio/*.mp3 로 만듭니다(저작권 걱정 없는 오리지널).
# 실행: python3 tools/make_bgm.py   (numpy, ffmpeg 필요)
import numpy as np, subprocess, os, tempfile
SR = 32000
OUT = os.path.join(os.path.dirname(__file__), '..', 'audio')
rng = np.random.default_rng(11)
def hz(m): return 440.0 * 2 ** ((m - 69) / 12)

class Loop:
    """길이가 정해진 반복 곡: 소리를 더할 때 끝을 넘으면 처음으로 되감아서(이음새 없이) 이어집니다."""
    def __init__(self, seconds):
        self.n = int(seconds * SR); self.L = np.zeros(self.n); self.R = np.zeros(self.n)
    def add(self, t, sig, pan=0.0, gain=1.0):
        i = int(t * SR) % self.n; k = len(sig)
        gl, gr = gain * (1 - max(0, pan)), gain * (1 + min(0, pan))
        while k > 0:
            m = min(k, self.n - i); seg = sig[len(sig) - k: len(sig) - k + m]
            self.L[i:i+m] += seg * gl; self.R[i:i+m] += seg * gr; i = 0; k -= m
    def reverb(self, seconds, wet):
        ir_n = int(seconds * SR); tt = np.arange(ir_n) / SR
        for name in ('L', 'R'):
            ir = rng.standard_normal(ir_n) * np.exp(-tt * (6.9 / seconds)); ir[0] = 0
            ir /= np.sqrt(np.sum(ir ** 2)) + 1e-9
            x = getattr(self, name); size = max(self.n, ir_n)
            y = np.fft.irfft(np.fft.rfft(x, size) * np.fft.rfft(ir, size), size)   # 원형 합성곱 → 꼬리가 처음으로 이어짐
            y = y[:self.n] + (y[self.n:self.n + ir_n] if size > self.n else 0)[:self.n] if size > self.n else y[:self.n]
            setattr(self, name, x * (1 - wet) + y * wet * 1.6)
    def save(self, path):
        peak = max(np.abs(self.L).max(), np.abs(self.R).max()) + 1e-9
        st = np.stack([self.L, self.R], 1) / peak * 0.8
        raw = (st * 32767).astype('<i2').tobytes()
        with tempfile.NamedTemporaryFile(suffix='.raw', delete=False) as f: f.write(raw); tmp = f.name
        subprocess.run(['ffmpeg', '-y', '-loglevel', 'error', '-f', 's16le', '-ar', str(SR), '-ac', '2', '-i', tmp, '-b:a', '112k', path], check=True)
        os.remove(tmp)

def env(n, a, r):
    e = np.ones(n); na, nr = int(a * SR), int(r * SR)
    if na: e[:na] = np.linspace(0, 1, na)
    if nr: e[-nr:] *= np.linspace(1, 0, nr)
    return e
def pad(f, dur, vol=0.12):
    t = np.arange(int(dur * SR)) / SR
    s = sum(np.sin(2 * np.pi * f * d * t + ph) for d, ph in [(1, 0), (1.004, 1.1), (0.996, 2.3), (2, 0.5)])
    return s * env(len(t), dur * 0.35, dur * 0.4) * vol / 4
def bell(f, dur=2.4, vol=0.2):
    t = np.arange(int(dur * SR)) / SR
    s = np.sin(2 * np.pi * f * t) + 0.35 * np.sin(2 * np.pi * f * 2.76 * t) * np.exp(-t * 6) + 0.18 * np.sin(2 * np.pi * f * 5.4 * t) * np.exp(-t * 9)
    return s * np.exp(-t * 2.2) * np.minimum(1, t * 400) * vol
def marimba(f, dur=0.9, vol=0.3):
    t = np.arange(int(dur * SR)) / SR
    s = np.sin(2 * np.pi * f * t) + 0.5 * np.sin(2 * np.pi * f * 4 * t) * np.exp(-t * 14)
    return s * np.exp(-t * 5.5) * np.minimum(1, t * 600) * vol
def kick(vol=0.5):
    t = np.arange(int(0.35 * SR)) / SR
    return np.sin(2 * np.pi * (60 * t + 40 * (1 - np.exp(-t * 18)) / 18)) * np.exp(-t * 10) * vol
def shaker(vol=0.05):
    t = np.arange(int(0.12 * SR)) / SR
    n = rng.standard_normal(len(t)); n = np.diff(n, prepend=0)    # 고음만 남김
    return n * np.exp(-t * 38) * vol

# ---------- 우주: 느리고 몽환적인 패드 + 반짝이는 높은 종소리 ----------
def space():
    d = 40.0; lp = Loop(d)
    chords = [[50, 57, 62, 65], [46, 53, 57, 62], [43, 50, 55, 58], [45, 52, 57, 61]]   # Dm - Bb - Gm - A
    for i, ch in enumerate(chords):
        for m in ch: lp.add(i * 10 - 1.0, pad(hz(m), 12.0), pan=rng.uniform(-.5, .5))
    scale = [74, 77, 79, 81, 84, 86, 89]   # D 단조 오음계 위쪽
    for k in range(36):
        t = k * (d / 36) + rng.uniform(-0.15, 0.15)
        lp.add(t, bell(hz(rng.choice(scale)), 3.2, 0.13), pan=rng.uniform(-.8, .8))
    lp.reverb(3.2, 0.55); return lp
# ---------- 눈나라: 오르골 멜로디 + 포근한 패드 + 썰매 방울 ----------
def snow():
    bpm = 84; beat = 60 / bpm; bars = 16; d = bars * 4 * beat; lp = Loop(d)
    prog = [[48, 55, 64], [45, 52, 60], [41, 48, 57], [43, 50, 59]]     # C - Am - F - G
    for b in range(bars):
        for m in prog[b % 4]: lp.add(b * 4 * beat - .2, pad(hz(m), 4 * beat + .6, .10), pan=rng.uniform(-.4, .4))
    mel = [[72, 76, 79, 76, 72, 76, 79, 84], [72, 76, 81, 76, 72, 76, 81, 79], [69, 72, 77, 72, 69, 72, 77, 76], [71, 74, 79, 74, 71, 74, 79, 77]]
    for b in range(bars):
        pat = mel[b % 4]
        for j, m in enumerate(pat):
            if b % 8 >= 6 and j % 2: continue            # 곡 끝으로 갈수록 한숨 쉬어가기
            lp.add(b * 4 * beat + j * beat / 2, bell(hz(m), 2.0, 0.16), pan=0.25)
    for b in range(bars):
        for j in range(8): lp.add(b * 4 * beat + j * beat / 2 + (beat / 4 if j % 2 else 0), shaker(0.035 if j % 2 else 0.05), pan=-0.3)
    lp.reverb(2.2, 0.35); return lp
# ---------- 공룡섬: 마림바 리듬 + 북 + 낮은 패드 ----------
def island():
    bpm = 104; beat = 60 / bpm; bars = 16; d = bars * 4 * beat; lp = Loop(d)
    for i, m in enumerate([45, 45, 43, 40]):
        for b in range(4): lp.add((i * 4 + b) * 4 * beat - .1, pad(hz(m), 4 * beat + .5, .13), pan=0)
    penta = [57, 60, 62, 64, 67, 69, 72]                  # A 단조 오음계
    riff = [0, None, 2, 3, None, 4, 3, 2, 0, None, 2, 4, 5, None, 4, 2]
    for b in range(bars):
        for j, idx in enumerate(riff):
            if idx is None: continue
            if b % 4 == 3 and j > 9: continue
            lp.add(b * 4 * beat + j * beat / 4, marimba(hz(penta[idx] + (12 if b % 8 >= 4 and j % 4 == 0 else 0)), 0.8, 0.28), pan=0.3)
    for b in range(bars):
        for j in (0, 6, 8, 10):                           # 둥둥 북
            lp.add(b * 4 * beat + j * beat / 4, kick(0.42 if j == 0 else 0.3))
        for j in range(16): lp.add(b * 4 * beat + j * beat / 4, shaker(0.03 if j % 2 else 0.045), pan=-0.35)
    lp.reverb(1.4, 0.25); return lp

for name, fn in [('space', space), ('snow', snow), ('island', island)]:
    lp = fn(); path = os.path.join(OUT, f'{name}_ost.mp3'); lp.save(path)
    print(name, f'{lp.n / SR:.1f}s', os.path.getsize(path) // 1024, 'KB')
