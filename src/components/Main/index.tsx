import Content from '@/components/content';
import Footer from '@/components/footer';
import Toolbar from '@/components/toolbar';

function Home() {
  return (
    <div className="size-full overflow-y-auto scroll-smooth bg-default">
      <div className="relative flex flex-col p-8">
        <Toolbar />
        <Content />
      </div>
      <Footer />
    </div>
  );
}

export default Home;
