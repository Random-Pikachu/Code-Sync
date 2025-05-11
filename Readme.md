<h1 align="center" id="title">Code Sync</h1>
<p style = "font-size:16px;">Code Sync is a real-time collaborative code editor that lets multiple users write, edit, and execute code together with support for file management, syntax highlighting, and multi-language execution.</p>

<h2>🚀 Demo</h2>

[https://codesync-v8bl.onrender.com](https://codesync-v8bl.onrender.com)

<h2>💻 Technologies Used</h2>
<div style="display: flex; align-items: center; gap: 12px;">
  <img src="https://cdn.jsdelivr.net/gh/devicons/devicon/icons/react/react-original.svg" height="40" alt="react logo" />
  <img src="https://cdn.jsdelivr.net/gh/devicons/devicon@latest/icons/socketio/socketio-original.svg" height="40" alt="socket.io logo" style="filter: invert(1) brightness(2);" />
  <img src="https://cdn.jsdelivr.net/gh/devicons/devicon@latest/icons/nodejs/nodejs-original-wordmark.svg" height="40" alt="node logo"/>
  <img src="https://cdn.jsdelivr.net/gh/devicons/devicon@latest/icons/mongodb/mongodb-original-wordmark.svg" height="40" alt="mongoDB logo"/>
  <img src="https://cdn.jsdelivr.net/gh/devicons/devicon@latest/icons/tailwindcss/tailwindcss-original.svg" height="40" alt="tailwind logo" />
</div>





<h2> 📷 Project Screenshots:</h2>

<img src="https://media-hosting.imagekit.io/79a1a05a1da04e1a/ss.png?Expires=1841584265&amp;Key-Pair-Id=K2ZIVPTIP2VGHC&amp;Signature=ywcC7GCbsQVn-E5oNHzVyLJHYQZWJC33nMeUJOLxLlbQnN6mdyND8jp9QlJfTsOB26X1eDEXlh1aGd5f5ShwOfmg1-xRezZKMhZ5Km8RX2wpVvOFGbb-~zRHmc9s4imbfGdjU3HqqeasEqe5DPXJg1d4cZk0COZV1mlMD2-IwjguFERPHclVp77i6AOupVyGt0vzpHZxVJvTRuSVE0SLPjTMpMVJIqItWZvbNqbLnFScXqHvJONRsy6yEhDme6Sgm2gggxMOwmUp7P77e46DvlQJP7E7chcaAyrIQJBbR6IGyTXSto-TSQQOYDusQlnzbPv21VY-bvdYzJn4KzPxCA__" alt="project-screenshot">

<br />
<br />

<img src="https://media-hosting.imagekit.io/59720f6dc58b4cbc/ss_1.png?Expires=1841584146&amp;Key-Pair-Id=K2ZIVPTIP2VGHC&amp;Signature=cD0Vhanggm1ZeFkTMztOEXMisxBxmgkGL7Rj9EXARz-QqeSWbxxl~2MSC6yYkcBaONYsJ~8mmm2AL6AZ1eABfbcVhu-DuC6eJpUZkXz92pDx8mPVsSnJste93-kkUr31aDbzEa-2utju2piZQMUGSiv5~Bv-z8zj2Ok6mA2cuL~DhQvC0ksR-C~kxxnHi9ZCkcyCHQRxePtCf6ejvquNoL8ZVH9zlksLjCRHf07kQFZzXjO1ZbnKKtIxdJb9YmyrT-Tx7PmKa-eWRMFPoGA3pSWZaLgNe~1Qvuy3wj2ch~x7osPKUgggSZNrr2d5KVIO8-YTlhvPTcgMhLZGLT3UQQ__" alt="project-screenshot">


<h2>🧐 Features</h2>

Here're some of the project's best features:

*   Real-time Code Collaboration
*   Live Cursor Tracking
*   Multi-language support with syntax highlighting
*   Session sharing via unique URLs
*   File system synchronization
*   Code Execution

<h2>📩 Installation</h2>
<h3>1. Clone the repository</h3>

```bash
git clone https://github.com/Random-Pikachu/Code-Sync.git
cd Code-Sync
```

<h3>2. Install Libraries</h3>

```bash
#Install Client libraries
cd client
npm install

#Install Backend libraries
cd server
npm install
```

<h3>3. Setup Enviroment variables</h3>

```bash
#Backend .env
PORT = 5600
MONGODB_USERNAME = <username>
MONGODB_PASSWORD = <password>
```

<h3>4. Run the files</h3>

```bash
#client side
cd client
npm run dev

#backend side
cd server
npm start
```

<h3>⚡ Websocket Events</h3>

<table style="width:100%; border-collapse: collapse; background-color: #000; color: #f8f8f2; text-align: center;">
  <thead>
    <tr style="background-color: #1a1a1a;">
      <th style="border: 1px solid #333; padding: 10px; text-align:center;">Event</th>
      <th style="border: 1px solid #333; padding: 10px; text-align:center;">Use</th>
    </tr>
  </thead>
  <tbody>
    <tr>
      <td style="border: 1px solid #333; padding: 10px;">join</td>
      <td style="border: 1px solid #333; padding: 10px;">User joins a new room</td>
    </tr>
    <tr style="background-color: #111;">
      <td style="border: 1px solid #333; padding: 10px;">init-file-struct</td>
      <td style="border: 1px solid #333; padding: 10px;">To send initial file structure in a room</td>
    </tr>
    <tr>
      <td style="border: 1px solid #333; padding: 10px;">user-list</td>
      <td style="border: 1px solid #333; padding: 10px;">Object of users present in a room</td>
    </tr>
    <tr style="background-color: #111;">
      <td style="border: 1px solid #333; padding: 10px;">joined</td>
      <td style="border: 1px solid #333; padding: 10px;">User joins a existing room</td>
    </tr>
    <tr>
      <td style="border: 1px solid #333; padding: 10px;">update-file-struct</td>
      <td style="border: 1px solid #333; padding: 10px;">Updating the file tree structure for every new file/folder creation</td>
    </tr>
    <tr style="background-color: #111;">
      <td style="border: 1px solid #333; padding: 10px;">update-file-content</td>
      <td style="border: 1px solid #333; padding: 10px;">Update & Store the content of files</td>
    </tr>
    <tr>
      <td style="border: 1px solid #333; padding: 10px;">file-content-updated</td>
      <td style="border: 1px solid #333; padding: 10px;">Confirmation for updation of content</td>
    </tr>
    <tr style="background-color: #111;">
      <td style="border: 1px solid #333; padding: 10px;">file-open</td>
      <td style="border: 1px solid #333; padding: 10px;">Which file user is currently editing</td>
    </tr>
    <tr>
      <td style="border: 1px solid #333; padding: 10px;">code-change</td>
      <td style="border: 1px solid #333; padding: 10px;">Checks for change in editor window</td>
    </tr>
    <tr style="background-color: #111;">
      <td style="border: 1px solid #333; padding: 10px;">sync-code</td>
      <td style="border: 1px solid #333; padding: 10px;">Synchronizes the code changes for all users</td>
    </tr>
    <tr>
      <td style="border: 1px solid #333; padding: 10px;">cursor-position</td>
      <td style="border: 1px solid #333; padding: 10px;">Checks for change in cursor positon</td>
    </tr>
    <tr style="background-color: #111;">
      <td style="border: 1px solid #333; padding: 10px;">disconnect</td>
      <td style="border: 1px solid #333; padding: 10px;">User Disconnects from room</td>
    </tr>
  </tbody>
</table>

<h5 align="center" >Made with ❤ by Sangam</h5>