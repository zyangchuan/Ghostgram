import searchLogo from "../assets/user-round-search.png";

export default function SearchBar() {
  return (
    <view className="flex w-full h-12 p-2 bg-neutral-200 rounded-xl gap-2">
      <image src={searchLogo} auto-size className="opacity-50" />
      <input placeholder="Search users" className="w-full" />
    </view>
  )
}