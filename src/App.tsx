import { MessageSquare, Zap, DollarSign, Star, Bot, TrendingUp, Clock, Users, BarChart3, CheckCircle } from 'lucide-react';

function App() {
  return (
    <div className="min-h-screen bg-black text-white">
      <header className="border-b border-gray-800 sticky top-0 bg-black/95 backdrop-blur-sm z-50">
        <nav className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 flex justify-between items-center">
          <div className="flex items-center gap-2">
            <Bot className="w-8 h-8 text-orange-500" />
            <span className="text-xl font-bold">AI-Информатор</span>
          </div>
          <div className="flex gap-4">
            <button className="px-6 py-2 bg-orange-500 text-black font-semibold rounded-lg hover:bg-orange-600 transition-colors">
              Запросить демо
            </button>
            <button className="px-6 py-2 border border-orange-500 text-orange-500 font-semibold rounded-lg hover:bg-orange-500 hover:text-black transition-colors">
              Задать вопрос
            </button>
          </div>
        </nav>
      </header>

      <main>
        <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            <div>
              <h1 className="text-5xl font-bold leading-tight mb-6">
                ИИ-информатор для ресторанов
              </h1>
              <p className="text-xl text-gray-300 mb-8">
                Автоматизация обслуживания и коммуникаций с клиентами в Telegram и WhatsApp
              </p>

              <div className="space-y-6">
                <div className="border border-orange-500 rounded-xl p-6">
                  <div className="flex items-start gap-4">
                    <Zap className="w-6 h-6 text-orange-500 flex-shrink-0 mt-1" />
                    <div>
                      <h3 className="text-lg font-semibold mb-2">Ускоряет обслуживание</h3>
                      <p className="text-gray-300">Мгновенные ответы 24/7</p>
                    </div>
                  </div>
                </div>

                <div className="border border-orange-500 rounded-xl p-6">
                  <div className="flex items-start gap-4">
                    <DollarSign className="w-6 h-6 text-orange-500 flex-shrink-0 mt-1" />
                    <div>
                      <h3 className="text-lg font-semibold mb-2">Снижает затраты</h3>
                      <p className="text-gray-300">Экономия до $7000/месяц</p>
                    </div>
                  </div>
                </div>

                <div className="border border-orange-500 rounded-xl p-6">
                  <div className="flex items-start gap-4">
                    <Star className="w-6 h-6 text-orange-500 flex-shrink-0 mt-1" />
                    <div>
                      <h3 className="text-lg font-semibold mb-2">Повышает качество</h3>
                      <p className="text-gray-300">Безошибочный сервис</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <div className="relative">
              <div className="bg-gradient-to-br from-orange-500/20 to-orange-600/10 rounded-2xl p-8 border border-orange-500/30">
                <div className="space-y-4">
                  <div className="bg-black/50 rounded-lg p-4 border border-gray-700">
                    <MessageSquare className="w-8 h-8 text-orange-500 mb-2" />
                    <p className="text-sm text-gray-300">Общение в Telegram и WhatsApp</p>
                  </div>
                  <div className="bg-black/50 rounded-lg p-4 border border-gray-700">
                    <Bot className="w-8 h-8 text-orange-500 mb-2" />
                    <p className="text-sm text-gray-300">Поддержка 50+ языков</p>
                  </div>
                  <div className="bg-black/50 rounded-lg p-4 border border-gray-700">
                    <CheckCircle className="w-8 h-8 text-orange-500 mb-2" />
                    <p className="text-sm text-gray-300">Автоматизация заказов</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        <section className="bg-gradient-to-b from-black to-gray-900 py-20">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <h2 className="text-4xl font-bold text-center mb-16">Что делает система</h2>

            <div className="grid md:grid-cols-3 gap-8">
              <div>
                <h3 className="text-2xl font-bold mb-6 text-orange-500">Умные коммуникации</h3>
                <ul className="space-y-3 text-gray-300">
                  <li className="flex items-start gap-2">
                    <CheckCircle className="w-5 h-5 text-orange-500 flex-shrink-0 mt-0.5" />
                    <span>Общение в Telegram и WhatsApp</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <CheckCircle className="w-5 h-5 text-orange-500 flex-shrink-0 mt-0.5" />
                    <span>Распознавание текста и голоса</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <CheckCircle className="w-5 h-5 text-orange-500 flex-shrink-0 mt-0.5" />
                    <span>Поддержка 50+ языков</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <CheckCircle className="w-5 h-5 text-orange-500 flex-shrink-0 mt-0.5" />
                    <span>Анализ фотографий блюд</span>
                  </li>
                </ul>
              </div>

              <div>
                <h3 className="text-2xl font-bold mb-6 text-orange-500">Автоматизация заказов</h3>
                <ul className="space-y-3 text-gray-300">
                  <li className="flex items-start gap-2">
                    <CheckCircle className="w-5 h-5 text-orange-500 flex-shrink-0 mt-0.5" />
                    <span>Загрузка меню из Syrve</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <CheckCircle className="w-5 h-5 text-orange-500 flex-shrink-0 mt-0.5" />
                    <span>Помощь в выборе блюд</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <CheckCircle className="w-5 h-5 text-orange-500 flex-shrink-0 mt-0.5" />
                    <span>Проверка адреса доставки</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <CheckCircle className="w-5 h-5 text-orange-500 flex-shrink-0 mt-0.5" />
                    <span>Формирование заказа</span>
                  </li>
                </ul>
              </div>

              <div>
                <h3 className="text-2xl font-bold mb-6 text-orange-500">Персонализация</h3>
                <ul className="space-y-3 text-gray-300">
                  <li className="flex items-start gap-2">
                    <CheckCircle className="w-5 h-5 text-orange-500 flex-shrink-0 mt-0.5" />
                    <span>Профили клиентов</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <CheckCircle className="w-5 h-5 text-orange-500 flex-shrink-0 mt-0.5" />
                    <span>Авто-поздравления</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <CheckCircle className="w-5 h-5 text-orange-500 flex-shrink-0 mt-0.5" />
                    <span>Напоминания о заказах</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <CheckCircle className="w-5 h-5 text-orange-500 flex-shrink-0 mt-0.5" />
                    <span>Индивидуальные предложения</span>
                  </li>
                </ul>
              </div>
            </div>

            <div className="mt-12 bg-orange-900/30 border border-orange-500/50 rounded-xl p-6">
              <p className="text-lg text-center">
                <span className="font-semibold">Работает круглосуточно.</span> Не устает, не ошибается, не берет выходные.
              </p>
            </div>
          </div>
        </section>

        <section className="py-20 bg-black">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <h2 className="text-4xl font-bold text-center mb-16">Экономия на операторах</h2>

            <div className="grid lg:grid-cols-2 gap-12">
              <div className="border border-gray-700 rounded-2xl p-8">
                <h3 className="text-2xl font-bold mb-6 text-center">Традиционная модель</h3>
                <ul className="space-y-4 text-gray-300 mb-8">
                  <li>• 5-7 операторов для работы 24/7</li>
                  <li>• Зарплаты, налоги, обучение</li>
                  <li>• Человеческий фактор и ошибки</li>
                  <li>• Невозможность масштабирования</li>
                </ul>
                <div className="text-center">
                  <div className="text-4xl font-bold text-orange-500 mb-2">$2,500</div>
                  <p className="text-gray-400">Затраты: $2,500–$7,000/месяц</p>
                </div>
              </div>

              <div className="border border-orange-500 rounded-2xl p-8 bg-gradient-to-br from-orange-500/10 to-orange-600/5">
                <h3 className="text-2xl font-bold mb-6 text-center">С ИИ-ассистентом</h3>
                <ul className="space-y-4 text-gray-300 mb-8">
                  <li>• Один ассистент = вся команда</li>
                  <li>• Работа без выходных и отпусков</li>
                  <li>• Сотни обращений одновременно</li>
                  <li>• Мгновенное масштабирование</li>
                </ul>
                <div className="text-center">
                  <div className="text-4xl font-bold text-orange-500 mb-2">$50-$200</div>
                  <p className="text-gray-400">Затраты: $50–$200/месяц</p>
                </div>
              </div>
            </div>

            <div className="mt-16 grid md:grid-cols-3 gap-8 text-center">
              <div>
                <div className="text-5xl font-bold text-orange-500 mb-2">95%</div>
                <p className="text-xl text-gray-300">Снижение расходов</p>
                <p className="text-sm text-gray-500 mt-2">на персонал call-центра</p>
              </div>
              <div>
                <div className="text-5xl font-bold text-orange-500 mb-2">$2,500</div>
                <p className="text-xl text-gray-300">Минимальная экономия</p>
                <p className="text-sm text-gray-500 mt-2">при замене 5 операторов</p>
              </div>
              <div>
                <div className="text-5xl font-bold text-orange-500 mb-2">1-3</div>
                <p className="text-xl text-gray-300">Месяца окупаемости</p>
                <p className="text-sm text-gray-500 mt-2">начало экономии с первого дня</p>
              </div>
            </div>
          </div>
        </section>

        <section className="py-20 bg-gradient-to-b from-black to-gray-900">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <h2 className="text-4xl font-bold text-center mb-16">Рост повторных заказов</h2>

            <div className="grid md:grid-cols-2 gap-8 mb-16">
              <div className="bg-gray-900 border border-gray-700 rounded-2xl p-8">
                <div className="flex items-center gap-3 mb-4">
                  <div className="w-12 h-12 bg-orange-500/20 rounded-full flex items-center justify-center">
                    <Users className="w-6 h-6 text-orange-500" />
                  </div>
                  <h3 className="text-xl font-bold">Память о предпочтениях</h3>
                </div>
                <p className="text-gray-300">
                  Система запоминает любимые блюда каждого клиента и предлагает их при следующем заказе
                </p>
              </div>

              <div className="bg-gray-900 border border-gray-700 rounded-2xl p-8">
                <div className="flex items-center gap-3 mb-4">
                  <div className="w-12 h-12 bg-orange-500/20 rounded-full flex items-center justify-center">
                    <Star className="w-6 h-6 text-orange-500" />
                  </div>
                  <h3 className="text-xl font-bold">Персональные поздравления</h3>
                </div>
                <p className="text-gray-300">
                  Автоматические поздравления с днем рождения и специальные праздничные предложения
                </p>
              </div>

              <div className="bg-gray-900 border border-gray-700 rounded-2xl p-8">
                <div className="flex items-center gap-3 mb-4">
                  <div className="w-12 h-12 bg-orange-500/20 rounded-full flex items-center justify-center">
                    <TrendingUp className="w-6 h-6 text-orange-500" />
                  </div>
                  <h3 className="text-xl font-bold">Умные рекомендации</h3>
                </div>
                <p className="text-gray-300">
                  ИИ анализирует историю и предлагает новые блюда на основе вкусовых предпочтений
                </p>
              </div>

              <div className="bg-gray-900 border border-gray-700 rounded-2xl p-8">
                <div className="flex items-center gap-3 mb-4">
                  <div className="w-12 h-12 bg-orange-500/20 rounded-full flex items-center justify-center">
                    <Clock className="w-6 h-6 text-orange-500" />
                  </div>
                  <h3 className="text-xl font-bold">Своевременные напоминания</h3>
                </div>
                <p className="text-gray-300">
                  Уведомления о сезонном меню, акциях и любимых позициях недели
                </p>
              </div>
            </div>

            <div className="bg-orange-900/20 border border-orange-500/50 rounded-xl p-6 mb-12">
              <p className="text-lg text-center">
                Это создает <span className="font-bold text-orange-500">чувство внимания и заботы</span>. Клиенты возвращаются чаще, заказывают больше.
              </p>
            </div>

            <div className="grid md:grid-cols-2 gap-12 text-center">
              <div>
                <div className="mb-6">
                  <svg className="w-48 h-48 mx-auto" viewBox="0 0 100 100">
                    <circle cx="50" cy="50" r="40" fill="none" stroke="#1f2937" strokeWidth="8" />
                    <circle cx="50" cy="50" r="40" fill="none" stroke="#f97316" strokeWidth="8"
                            strokeDasharray="75 251" strokeLinecap="round" transform="rotate(-90 50 50)" />
                  </svg>
                </div>
                <div className="text-4xl font-bold text-orange-500 mb-2">25-40%</div>
                <p className="text-xl text-gray-300">Рост повторных заказов</p>
                <p className="text-sm text-gray-500 mt-2">благодаря персонализации</p>
              </div>

              <div>
                <div className="mb-6">
                  <svg className="w-48 h-48 mx-auto" viewBox="0 0 100 100">
                    <circle cx="50" cy="50" r="40" fill="none" stroke="#1f2937" strokeWidth="8" />
                    <circle cx="50" cy="50" r="40" fill="none" stroke="#f97316" strokeWidth="8"
                            strokeDasharray="88 251" strokeLinecap="round" transform="rotate(-90 50 50)" />
                  </svg>
                </div>
                <div className="text-4xl font-bold text-orange-500 mb-2">35%</div>
                <p className="text-xl text-gray-300">Увеличение среднего чека</p>
                <p className="text-sm text-gray-500 mt-2">за счет умных рекомендаций</p>
              </div>
            </div>
          </div>
        </section>

        <section className="py-20 bg-black">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <h2 className="text-4xl font-bold text-center mb-16">Возврат инвестиций</h2>

            <div className="grid md:grid-cols-3 gap-8 mb-16">
              <div className="border border-gray-700 rounded-2xl p-8">
                <h3 className="text-xl font-bold mb-6 text-orange-500">Первоначальные расходы</h3>
                <div className="space-y-4">
                  <div className="bg-gray-900 rounded-lg p-4">
                    <p className="text-sm text-gray-400 mb-2">Настройка системы</p>
                    <p className="text-gray-300">Единоразовая интеграция с вашей инфраструктурой</p>
                  </div>
                  <div className="bg-gray-900 rounded-lg p-4">
                    <p className="text-sm text-gray-400 mb-2">Обучение ИИ</p>
                    <p className="text-gray-300">Адаптация под ваше меню и процессы</p>
                  </div>
                </div>
              </div>

              <div className="border border-gray-700 rounded-2xl p-8">
                <h3 className="text-xl font-bold mb-6 text-orange-500">Ежемесячные затраты</h3>
                <div className="space-y-4">
                  <div className="bg-gray-900 rounded-lg p-4">
                    <p className="text-sm text-gray-400 mb-2">$50-$200</p>
                    <p className="text-gray-300">Подписка на ИИ-платформу в зависимости от объема</p>
                  </div>
                  <div className="bg-gray-900 rounded-lg p-4">
                    <p className="text-sm text-gray-400 mb-2">Техподдержка</p>
                    <p className="text-gray-300">Включена в стоимость подписки</p>
                  </div>
                </div>
              </div>

              <div className="border border-orange-500 rounded-2xl p-8 bg-gradient-to-br from-orange-500/10 to-orange-600/5">
                <h3 className="text-xl font-bold mb-6 text-orange-500">Доходы и экономия</h3>
                <div className="space-y-4">
                  <div className="bg-gray-900 rounded-lg p-4">
                    <p className="text-sm text-gray-400 mb-2">$2,500+</p>
                    <p className="text-gray-300">Экономия на операторах каждый месяц</p>
                  </div>
                  <div className="bg-gray-900 rounded-lg p-4">
                    <p className="text-sm text-gray-400 mb-2">15-25%</p>
                    <p className="text-gray-300">Рост продаж за счет качества сервиса</p>
                  </div>
                </div>
              </div>
            </div>

            <div className="grid md:grid-cols-3 gap-8 text-center">
              <div>
                <div className="text-5xl font-bold text-orange-500 mb-2">1-3</div>
                <p className="text-xl text-gray-300 mb-2">Месяца до окупаемости</p>
                <p className="text-sm text-gray-500">быстрый возврат инвестиций</p>
              </div>
              <div>
                <div className="text-5xl font-bold text-orange-500 mb-2">$30K+</div>
                <p className="text-xl text-gray-300 mb-2">Годовая экономия</p>
                <p className="text-sm text-gray-500">на одну точку при среднем ресторане</p>
              </div>
              <div>
                <div className="text-5xl font-bold text-orange-500 mb-2">300%</div>
                <p className="text-xl text-gray-300 mb-2">ROI за первый год</p>
                <p className="text-sm text-gray-500">с учетом роста продаж и экономии</p>
              </div>
            </div>
          </div>
        </section>

        <section className="py-20 bg-gradient-to-b from-black to-gray-900">
          <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
            <h2 className="text-4xl font-bold text-center mb-8">Готовы к трансформации?</h2>
            <p className="text-xl text-gray-300 text-center mb-16">
              ИИ-информатор делает работу ресторана <span className="text-orange-500 font-semibold">быстрее, умнее и прибыльнее</span>. Технология, которая окупается с первого месяца.
            </p>

            <div className="grid md:grid-cols-2 gap-6 mb-16">
              <div className="border border-orange-500 rounded-xl p-6">
                <div className="flex items-center gap-3 mb-3">
                  <DollarSign className="w-6 h-6 text-orange-500" />
                  <h3 className="text-lg font-bold">Снижает расходы</h3>
                </div>
                <p className="text-gray-300">Экономия до 95% на операторах</p>
              </div>

              <div className="border border-orange-500 rounded-xl p-6">
                <div className="flex items-center gap-3 mb-3">
                  <TrendingUp className="w-6 h-6 text-orange-500" />
                  <h3 className="text-lg font-bold">Увеличивает продажи</h3>
                </div>
                <p className="text-gray-300">Рост выручки на 15-25%</p>
              </div>

              <div className="border border-orange-500 rounded-xl p-6">
                <div className="flex items-center gap-3 mb-3">
                  <Clock className="w-6 h-6 text-orange-500" />
                  <h3 className="text-lg font-bold">Работает 24/7</h3>
                </div>
                <p className="text-gray-300">Без перерывов и выходных</p>
              </div>

              <div className="border border-orange-500 rounded-xl p-6">
                <div className="flex items-center gap-3 mb-3">
                  <Star className="w-6 h-6 text-orange-500" />
                  <h3 className="text-lg font-bold">Улучшает впечатления</h3>
                </div>
                <p className="text-gray-300">Персонализация и скорость</p>
              </div>

              <div className="border border-orange-500 rounded-xl p-6 md:col-span-2">
                <div className="flex items-center gap-3 mb-3">
                  <BarChart3 className="w-6 h-6 text-orange-500" />
                  <h3 className="text-lg font-bold">Легко масштабируется</h3>
                </div>
                <p className="text-gray-300">От одной до сотен точек</p>
              </div>
            </div>

            <div className="bg-gray-900 border border-orange-500/50 rounded-2xl p-8 mb-8">
              <h3 className="text-2xl font-bold mb-4 text-center">Следующий шаг</h3>
              <p className="text-gray-300 text-center mb-6">
                Готовы подключить <span className="text-orange-500 font-semibold">демонстрацию</span> и протестировать систему на вашем ресторане. Увидите результаты уже в первую неделю.
              </p>
            </div>

            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <button className="px-8 py-4 bg-orange-500 text-black text-lg font-semibold rounded-lg hover:bg-orange-600 transition-colors">
                Запросить демо
              </button>
              <button className="px-8 py-4 border border-orange-500 text-orange-500 text-lg font-semibold rounded-lg hover:bg-orange-500 hover:text-black transition-colors">
                Задать вопрос
              </button>
            </div>
          </div>
        </section>
      </main>

      <footer className="bg-black border-t border-gray-800 py-8">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center text-gray-400">
          <p>ИИ-Информатор для ресторанов - Автоматизация обслуживания клиентов</p>
        </div>
      </footer>
    </div>
  );
}

export default App;
