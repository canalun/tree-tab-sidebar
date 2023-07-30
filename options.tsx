import extListIcon from 'data-base64:./assets/ext_list_icon.png'
import pin from 'data-base64:./assets/pin.png'
import addedIcon from 'data-base64:./assets/added_icon.png'
import addedPanel from 'data-base64:./assets/added_panel.png'

function NewTab() {
  return (
    <>
      <div style={{ fontSize: '18px' }}>
        <p>(日本語版が下にあります)</p>
        <p>Thank you for installing me🎉</p>
        <p>
          Please <strong>follow just four steps as below</strong>, for the sake
          of your new tab experience!!🦖
        </p>
        <p>
          <strong>
            1. Open the extension list by clicking the below "jigsaw puzzle"
            icon at the top right of this window.
          </strong>
        </p>
        <img style={{ width: '200px' }} src={extListIcon}></img>
        <p>
          <strong>
            2. Find the item of this extension from the list, and clicking the
            icon of "pin".
          </strong>
        </p>
        <img style={{ width: '340px', marginBottom: '20px' }} src={pin}></img>
        <br></br>
        <p>
          <strong>
            Now, you can find the icon of this extension fixed at the top right
            of this window.
          </strong>
        </p>
        <img style={{ width: '300px' }} src={addedIcon}></img>
        <p>
          <strong>
            3. Click the added icon, and you can find the sidepanel opened!
          </strong>
        </p>
        <img style={{ width: '500px' }} src={addedPanel}></img>
        <p>
          <strong>
            4. Refresh this page, and you can find the sidepanel displays the
            tab list!
          </strong>
        </p>
        <p>
          We know you may have some inconvenience while using this extension.
          Please look forward to much improvement!!
        </p>
        <p>
          Ofcourse, this onboarding page will be much more nicer in the future✌
        </p>
      </div>
      <hr />
      <div style={{ fontSize: '18px' }}>
        <p>(日本語版が下にあります)</p>
        <p>インストールしてくださりありがとうございます🎉</p>
        <p>下記の4つの手順にしたがって、新しいタブの世界へいきましょ〜！🦖</p>
        <p>
          <strong>
            1.
            このウィンドウの右上にあるジグソーパズルのアイコンを押して、拡張のリストを表示して下さい
          </strong>
        </p>
        <img style={{ width: '200px' }} src={extListIcon}></img>
        <p>
          <strong>
            2.
            リストの中にあるこの拡張の欄の、ピンのアイコンをクリックして下さい
          </strong>
        </p>
        <img style={{ width: '340px', marginBottom: '20px' }} src={pin}></img>
        <br></br>
        <p>
          <strong>この拡張のアイコンが右上に追加されたはずです</strong>
        </p>
        <img style={{ width: '300px' }} src={addedIcon}></img>
        <p>
          <strong>
            3.
            追加されたアイコンをクリックしてください。サイドバーが画面の右に追加されます！
          </strong>
        </p>
        <img style={{ width: '500px' }} src={addedPanel}></img>
        <p>
          <strong>
            4. このページを更新して下さい！サイドバーにタブが表示されます！
          </strong>
        </p>
        <p>
          いろいろな不便がまだまだあるかと思います。しかし、すべてのびしろです！いまはまだご容赦下さい👶
        </p>
        <p>
          もちろんこのスタートページも、いつかもう少しだけマシになる予定です。お楽しみに✌
        </p>
      </div>
    </>
  )
}

export default NewTab
