// Cloudflare Worker для проксирования dev.ioperator.ai на GitHub Pages
// Скопируйте этот код в Cloudflare Workers Dashboard

export default {
  async fetch(request) {
    const url = new URL(request.url);
    
    // Проксируем все запросы на GitHub Pages
    const targetUrl = `https://st-VALVe.github.io/iOperator_website${url.pathname}${url.search}`;
    
    // Создаем новый запрос с правильными заголовками
    const modifiedRequest = new Request(targetUrl, {
      method: request.method,
      headers: request.headers,
      body: request.body,
    });
    
    // Выполняем запрос
    const response = await fetch(modifiedRequest);
    
    // Возвращаем ответ с правильными заголовками
    return new Response(response.body, {
      status: response.status,
      statusText: response.statusText,
      headers: {
        ...response.headers,
        'Access-Control-Allow-Origin': '*',
      },
    });
  },
};


