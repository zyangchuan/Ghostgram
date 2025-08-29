
import heart from "../assets/heart.png"
import messageSquare from "../assets/message-square.png"
import externalLink from "../assets/external-link.png"
import user from "../assets/circle-user-round.png"
import ellipsis from "../assets/ellipsis-vertical.png"

export default function Layout({ post }) {
  return (
    <view className="w-full shadow-xl rounded-2xl border-2 border-neutral-200">
      <view className="w-full p-3 flex justify-between items-center">
        <view className="flex items-center gap-2">
          <image src={user} mode="aspectFill" auto-size className="w-6" />
          <text className="text-xl font-semibold">{post.userName}</text>
          {post.relationship === "Stranger" 
            ? (<text className="text-lg font-semibold text-orange-400">• {post.relationship}</text>) 
            : (<text className="text-lg font-semibold text-green-400">• {post.relationship}</text>)}
          
        </view>
        <image src={ellipsis} mode="aspectFill" auto-size className="w-7" />
      </view>
      
      <image src={post.imageUrl} mode="aspectFill" auto-size className="w-full " />
      <view className="px-5">
        <view className="w-full py-2 flex items-center gap-8">
          <image src={heart} mode="aspectFill" auto-size className="w-8" />
          <image src={messageSquare} mode="aspectFill" auto-size className="w-8" />
          <image src={externalLink} mode="aspectFill" auto-size className="w-8" />
        </view>   
        <text className="text-lg mb-5"><text className="text-lg font-semibold">{post.userName}</text>  {post.description}</text>
      </view>
    </view>
  )
}