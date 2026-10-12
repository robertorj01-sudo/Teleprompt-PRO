import { useState, useRef, useEffect, useCallback } from 'react';

export function useVideoRecorder() {
  const [isRecording, setIsRecording] = useState<boolean>(false);
  const [recordingDuration, setRecordingDuration] = useState<number>(0);
  const [recordedVideoUrl, setRecordedVideoUrl] = useState<string | null>(null);
  const [recordedBlob, setRecordedBlob] = useState<Blob | null>(null);
  const [error, setError] = useState<string | null>(null);

  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const chunksRef = useRef<Blob[]>([]);
  const timerRef = useRef<NodeJS.Timeout | null>(null);

  // Limpeza de stream e URL ao desmontar
  useEffect(() => {
    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
      if (streamRef.current) {
        streamRef.current.getTracks().forEach((track) => track.stop());
      }
      if (recordedVideoUrl) {
        URL.revokeObjectURL(recordedVideoUrl);
      }
    };
  }, [recordedVideoUrl]);

  const startRecording = useCallback(async () => {
    setError(null);
    try {
      let stream: MediaStream;
      try {
        // Solicita câmera (compatível com webcams de notebook 720p/1080p e celulares) e microfone
        stream = await navigator.mediaDevices.getUserMedia({
          video: {
            width: { ideal: 1280 },
            height: { ideal: 720 },
          },
          audio: true,
        });
      } catch {
        // Fallback universal para qualquer webcam de notebook
        stream = await navigator.mediaDevices.getUserMedia({
          video: true,
          audio: true,
        });
      }

      streamRef.current = stream;
      chunksRef.current = [];

      // Determina o formato suportado pelo navegador
      let mimeType = 'video/webm;codecs=vp9,opus';
      if (!MediaRecorder.isTypeSupported(mimeType)) {
        mimeType = 'video/webm;codecs=vp8,opus';
      }
      if (!MediaRecorder.isTypeSupported(mimeType)) {
        mimeType = 'video/webm';
      }
      if (!MediaRecorder.isTypeSupported(mimeType)) {
        mimeType = ''; // Deixa o navegador escolher o padrão (ex: video/mp4 no Safari)
      }

      const recorder = new MediaRecorder(stream, mimeType ? { mimeType } : undefined);

      recorder.ondataavailable = (event) => {
        if (event.data && event.data.size > 0) {
          chunksRef.current.push(event.data);
        }
      };

      recorder.onstop = () => {
        const finalBlob = new Blob(chunksRef.current, {
          type: recorder.mimeType || 'video/webm',
        });
        const url = URL.createObjectURL(finalBlob);
        setRecordedBlob(finalBlob);
        setRecordedVideoUrl(url);

        // Encerra as faixas da gravação para liberar o hardware
        if (streamRef.current) {
          streamRef.current.getTracks().forEach((t) => t.stop());
          streamRef.current = null;
        }
      };

      recorder.start(1000); // Coleta fatias a cada 1 segundo
      mediaRecorderRef.current = recorder;
      setIsRecording(true);
      setRecordingDuration(0);

      // Cronômetro da gravação
      if (timerRef.current) clearInterval(timerRef.current);
      timerRef.current = setInterval(() => {
        setRecordingDuration((prev) => prev + 1);
      }, 1000);
    } catch (err: any) {
      console.error('Erro ao iniciar gravação de vídeo:', err);
      setError('Permissão de câmera ou microfone não concedida para gravação.');
      setIsRecording(false);
    }
  }, []);

  const stopRecording = useCallback(() => {
    if (timerRef.current) {
      clearInterval(timerRef.current);
      timerRef.current = null;
    }

    if (mediaRecorderRef.current && mediaRecorderRef.current.state !== 'inactive') {
      mediaRecorderRef.current.stop();
    }
    setIsRecording(false);
  }, []);

  const resetRecording = useCallback(() => {
    if (recordedVideoUrl) {
      URL.revokeObjectURL(recordedVideoUrl);
    }
    setRecordedVideoUrl(null);
    setRecordedBlob(null);
    setRecordingDuration(0);
    setError(null);
  }, [recordedVideoUrl]);

  const downloadRecording = useCallback(
    (fileName: string = 'apresentacao-teleprompter.webm') => {
      if (!recordedVideoUrl) return;

      const a = document.createElement('a');
      a.href = recordedVideoUrl;
      a.download = fileName;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
    },
    [recordedVideoUrl]
  );

  return {
    isRecording,
    recordingDuration,
    recordedVideoUrl,
    recordedBlob,
    error,
    startRecording,
    stopRecording,
    resetRecording,
    downloadRecording,
  };
}
