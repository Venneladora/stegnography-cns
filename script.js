function getBinaryString(message) {
  return message.split('')
    .map(char => char.charCodeAt(0).toString(2).padStart(8, '0'))
    .join('');
}

function embedMessage() {
  const fileInput = document.getElementById('imageInput');
  const message = document.getElementById('message').value;
  const canvas = document.getElementById('canvas');
  const ctx = canvas.getContext('2d');
  const status = document.getElementById('status');

  if (!fileInput.files[0] || !message) {
    alert("Upload an image and enter a message");
    return;
  }

  const img = new Image();
  const reader = new FileReader();

  reader.onload = function (e) {
    img.onload = function () {
      canvas.width = img.width;
      canvas.height = img.height;
      ctx.drawImage(img, 0, 0);

      const binary = getBinaryString(message) + '00000000'; // Null terminator
      const imgData = ctx.getImageData(0, 0, canvas.width, canvas.height);
      const pixels = imgData.data;

      let bitIndex = 0;
      for (let i = 0; i < pixels.length; i += 4) {
        for (let j = 0; j < 3; j++) {
          if (bitIndex >= binary.length) break;
          let byte = pixels[i + j];
          const bit = parseInt(binary[bitIndex]);
          byte = (byte & ~(1 << 6)) | (bit << 6);  // 7th bit (bit index 6)
          pixels[i + j] = byte;
          bitIndex++;
        }
        if (bitIndex >= binary.length) break;
      }

      ctx.putImageData(imgData, 0, 0);
      const link = document.createElement('a');
      link.download = 'encrypted.png';
      link.href = canvas.toDataURL();
      link.click();
      status.innerText = "Message successfully embedded using 7th bit!";
    };
    img.src = e.target.result;
  };
  reader.readAsDataURL(fileInput.files[0]);
}

function extractMessage() {
  const fileInput = document.getElementById('decryptImage');
  const canvas = document.getElementById('canvas');
  const ctx = canvas.getContext('2d');
  const decoded = document.getElementById('decodedMessage');

  if (!fileInput.files[0]) {
    alert("Upload an encrypted image");
    return;
  }

  const img = new Image();
  const reader = new FileReader();

  reader.onload = function (e) {
    img.onload = function () {
      canvas.width = img.width;
      canvas.height = img.height;
      ctx.drawImage(img, 0, 0);
      const imgData = ctx.getImageData(0, 0, canvas.width, canvas.height);
      const pixels = imgData.data;

      let binary = '';
      for (let i = 0; i < pixels.length; i += 4) {
        for (let j = 0; j < 3; j++) {
          let byte = pixels[i + j];
          binary += ((byte >> 6) & 1).toString();  // Extract 7th bit
        }
      }

      let message = '';
      for (let i = 0; i < binary.length; i += 8) {
        const byte = binary.slice(i, i + 8);
        if (byte === '00000000') break;  // Null terminator
        message += String.fromCharCode(parseInt(byte, 2));
      }
      decoded.innerText = `🔍 Hidden Message is: ${message}`;
    };
    img.src = e.target.result;
  };
  reader.readAsDataURL(fileInput.files[0]);
}
