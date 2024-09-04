import './tabs.scss'
import { html } from "src/utils"
import { View } from "src/ui/common/view"
import { draggable } from "./draggable"


interface TabContainerProps {
  className?: string
  onToggle: (tabId: string) => void
  onClose: (tabId: string) => void
}

export class TabContainer extends View {

  container: HTMLElement

  constructor(private props: TabContainerProps) {
    super()

    this.containerEl = html`<div class="typ-tabs-wrapper ${props.className}"></div>`
    this.containerEl.append(this.container =
      $('<div class="typ-tabs"></div>')
        // handle: left click
        .on('click', event => {
          const $clickedEl = $(event.target)
          const $tab = $clickedEl.closest('.typ-tab')
          if (!$tab.length) return

          const tabId = $tab.data('id')
          if ($clickedEl.hasClass('typ-close')) {
            this.props.onClose(tabId)
          }
          else {
            if ($tab.hasClass('active')) return
            this.props.onToggle(tabId)
          }
        })
        // handle: middle click
        .on('mousedown', event => {
          if (event.button !== 1) return

          const $clickedEl = $(event.target)
          const $tab = $clickedEl.closest('.typ-tab')
          if (!$tab.length) return

          const tabId = $tab.data('id')
          this.props.onClose(tabId)
        })
        // handle: scroll
        .on('wheel', (event) => {
          event.preventDefault()
          const el = event.target as HTMLElement
          let tabs
          if (tabs = el.closest('.typ-tabs-wrapper')) {
            const evt = event.originalEvent as WheelEvent
            tabs.scrollLeft += evt.deltaY
          }
        })
        .get(0)
    )

    // handle: draggable
    draggable(this.containerEl, 'x')
  }

  showTab(tabEl: HTMLElement) {
    this.containerEl.scrollLeft = tabEl.offsetLeft
  }

  addTab(tab: Tab) {
    this.activeTab(tab.containerEl)
    this.container.append(tab.containerEl)
    this.showTab(tab.containerEl)
  }

  renameTab(tabEl: HTMLElement, tab: Tab) {
    tabEl.replaceWith(tab.containerEl)
  }

  activeTab(tabEl: HTMLElement) {
    $('.typ-tab.active', this.containerEl).removeClass('active')

    tabEl.classList.add('active')
  }

  closeTab(tabEl: HTMLElement) {
    if (tabEl.classList.contains('active')) {
      const siblingTab = this.getSiblingTab(tabEl)
      this.activeTab(siblingTab)
      this.props.onToggle(siblingTab.dataset.id!)
    }
    tabEl.remove()
  }

  closeOtherTabs(tabEl: HTMLElement) {
    (Array.from(this.container.children) as HTMLElement[])
      .filter(el => el !== tabEl)
      .forEach(el => this.props.onClose(el.dataset.id))
  }

  closeRightTabs(tabEl: HTMLElement) {
    const tabEls = Array.from(this.container.children) as HTMLElement[]
    const currentIdx = tabEls.findIndex(el => el.dataset.id === tabEl.dataset.id!)
    const rightTabEls = tabEls.slice(currentIdx).slice(1)
    rightTabEls.forEach(el => this.props.onClose(el.dataset.id))
  }

  getSiblingTab(tabEl: HTMLElement) {
    return (tabEl.previousElementSibling
      ?? tabEl.nextElementSibling) as HTMLElement
  }
}

interface TabProps {
  id: string
  text: string | (() => HTMLElement | JQuery<HTMLElement>)
  title?: string
}

export class Tab extends View {
  constructor(props: TabProps) {
    super()

    this.containerEl = $(`<div class="typ-tab" data-id="${props.id}" draggable="true"></div>`)
      .attr('title', props.title || '')
      .append(typeof props.text === 'function'
        ? props.text()
        : props.text
      )
      .append(html`<i class="typ-icon typ-close"></i>`)
      .get(0)
  }
}
