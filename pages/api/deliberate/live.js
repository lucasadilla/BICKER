import emitter from '../../../lib/deliberateEvents';

export default function handler(req, res) {
  if (req.method !== 'GET') {
    res.setHeader('Allow', 'GET');
    res.status(405).end('Method Not Allowed');
    return;
  }

  res.setHeader('Content-Type', 'text/event-stream');
  res.setHeader('Cache-Control', 'no-cache');
  res.setHeader('Connection', 'keep-alive');
  res.setHeader('Access-Control-Allow-Origin', '*');

  // Send an initial comment to establish the stream
  res.write(': connected\n\n');

  const sendUpdate = (data = {}) => {
    const payload = {
      ...data,
      reactions: data.reactions || { red: {}, blue: {} },
    };

    res.write(`data: ${JSON.stringify(payload)}\n\n`);
  };

  const events = ['vote', 'reaction'];

  events.forEach((eventName) => emitter.on(eventName, sendUpdate));

  req.on('close', () => {
    events.forEach((eventName) => emitter.off(eventName, sendUpdate));
    res.end();
  });
}
