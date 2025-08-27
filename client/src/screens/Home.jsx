import SearchBar from "../components/SearchBar"
import plus from "../assets/plus.png";

export default function Home() {
  return (
    <view className="relative">
      <SearchBar />
      <view className="w-full fixed bottom-20 flex justify-center">
        <view className="bg-black shadow-md w-24 h-16 p-2 flex justify-center rounded-xl">
          <image src={plus} auto-size tint-color="#FFFFFF" />
        </view>
      </view>
    </view>
  )
}